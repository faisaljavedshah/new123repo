import {
  Component,
  ElementRef,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexStroke,
  ApexFill
} from 'ng-apexcharts';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthenticationService, profileService } from 'src/app/_services';
import { RecordingLists } from 'src/app/_services/recordingList';
import * as moment from 'moment';
import { DashBoard } from 'src/app/_services/dashboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs';
declare let pendo: any;
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  stroke: ApexStroke;
  fill: ApexFill;
};
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

let TREE_DATA = [
  { 'text': '', 'code': '0.1' },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  code?: string
}
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    // this.initialize();
  }

  initialize() {
    this.treeData = TREE_DATA;
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const data = this.buildFileTree(TREE_DATA, '0');
    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
   buildFileTree(obj: any[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code)?.startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        const children = obj.filter(so => (<string>so.code)?.startsWith(level + '.'));
        if (children && children.length > 0) {
          node.children = this.buildFileTree(children, o.code);
        }
        return node;
      });
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
  treeData: any[] = []
  filteredTreeData;
  public filter(filterText: string) {
    if (filterText) {
      this.filteredTreeData = this.treeData.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      Object.assign([], this.filteredTreeData).forEach(ftd => {
        let str = (<string>ftd.code);
        while (str?.lastIndexOf('.') > -1) {
          const index = str?.lastIndexOf('.');
          str = str?.substring(0, index);
          if (this.filteredTreeData.findIndex(t => t.code === str) === -1) {
            const obj = this.treeData.find(d => d.code === str);
            if (obj) {
              this.filteredTreeData.push(obj);
            }
          }
        }
        if(ftd.code.split(".").length == 3){
          const matches = this.treeData.filter(element => {
            if (element.code.includes(<string>ftd.code + ".")) {
              return true;
            }
          });
          this.filteredTreeData = this.filteredTreeData.concat(matches);
        }
      });
    } else {
      this.filteredTreeData = this.treeData;
    }

    const unique = (value, index, self) => {
      return self.indexOf(value) === index
    }
    this.filteredTreeData = this.filteredTreeData.filter(unique)
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.

    const data = this.buildFileTree(this.filteredTreeData, '0');

    // Notify the change.
    this.dataChange.next(data);
  }
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [ChecklistDatabase],
})

export class DashboardComponent implements OnInit, OnDestroy{
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  selectedParent: TodoItemFlatNode | null = null;
  newItemName = '';
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSourceTree: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  checkDomain='';
  isAdmin: boolean=false;
  userData: any;
  constructor(
    private elm: ElementRef,
    private auth: AuthenticationService,
    public listOfRecording: RecordingLists,
    private router: Router,
    private profileService: profileService,
    private dashboardService : DashBoard,
    private modalService: NgbModal,
    private _database: ChecklistDatabase
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSourceTree.data = data;
    });
  }


  widthToggle = false;
  calendarisactive = false;

  addWidth() {
    this.elm.nativeElement
      .querySelector('#mainTab')
      .classList.add('testingclasss');
  }
  removeWidth() {
    this.elm.nativeElement
      .querySelector('#mainTab')
      .classList.remove('testingclasss');
  }
  dd() {
    alert('hello');
  }
  currentValue: any;
  today1: string = ''
  ngOnInit(): void {
    pendo.initialize({
      visitor: {
          id: sessionStorage.getItem('userIDPendo')
      },
      account: {
          id: 'ACCOUNT-UNIQUE-ID-test'
      }
  });

    console.log('Down',pendo)
    this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    this.checkDomain = window.location.hostname
    this.dashboardService.currentGroupNames = 'All';
    this.today1 = moment().format('MM/DD/YY') + ' - ' + moment().format('MM/DD/YY');
    if(localStorage.getItem('adminInfo')){
      this.isAdmin = true;
  }else{
    this.isAdmin =false;
  }
    // TREE_DATA = JSON.parse(localStorage.getItem('groups'));
    // if(TREE_DATA){
    //   this.treeData = TREE_DATA;
    //   this._database.initialize();
    //   this.checkAll();
    //   // this.todoLeafItemSelectionToggle()
    //   this.getGroups();
    //   this.currentGroup = this.newCurrentArr.length + ' Groups selected';
    // }

    this.listOfRecording.recordingList().subscribe(d => {
      this.originalArray = d;
      this.agentList = d.data.agents;
      this.tagList = d.data.tags;
      this.group_data = d.data.groups;
      // localStorage.setItem('groups', JSON.stringify(d.data.groups));
      // localStorage.setItem('main_group',JSON.stringify(d.data.main_group));

      // TREE_DATA = d.data.groups
      // this.treeData = TREE_DATA
      // this._database.initialize();
      // this.checkAll();
      // this.getGroups();
      // localStorage.setItem('groupsTree',JSON.stringify([d.data?.groupsTree]));
      localStorage.setItem('logo',JSON.stringify(d.data.logo));
      // localStorage.setItem('buildTree', JSON.stringify(this.treeControl.dataNodes));

    }, err=>{
    //   localStorage.setItem('groups', JSON.stringify([]));
    //   localStorage.setItem('groupsTree',JSON.stringify([]));
    //   localStorage.setItem('logo',JSON.stringify(''));
    // localStorage.setItem('buildTree', JSON.stringify([]));
    // TREE_DATA = JSON.parse(localStorage.getItem('groups')) || [];
    //   this.treeData = TREE_DATA;
    //   this._database.initialize();
    //     this.checkAll();
    //     this.getGroups();
    // this.currentGroup = this.newCurrentArr.length + ' Groups selected';
    }
    );
    this.subject.pipe(debounceTime(1000)).subscribe((d: string) => {
      this.searchValue = d;
      if (d.length > 0) {
        this.listOfRecording.searchKeywords(d).subscribe(res => {
          this.isListOpen = true;
          this.recordingList = res;
          this.searchingKeyword = false;
        });
      } else {
        this.isListOpen = false;
        this.searchingKeyword = false;
        this.recordingList.length = 0;
      }
    });
    this.getdate({index : 0});
  }
  today: any = false;
  month: any = false;
  week: any = false;
  year: any = false;
  quarter: any = false;
  dateRange: any = false;
  GroupDataLoading : boolean = false;
  currentTab : number ;
  CurrentdateRange : string
  getdate(data) {
    this.dashboardService.renderGroupData.next(undefined)
    this.currentTab = data.index;
    this.today = false;
    this.month = false;
    this.week = false;
    this.year = false;
    this.quarter = false;
    this.dateRange = false;
    if (data.index == 0) {
      this.today = true;
      let now = new Date();
      this.CurrentdateRange = moment(now).format('MM/DD/YY');
    } else if (data.index == 1) {
      this.week = true;
      let startOfWeek = moment()
      .startOf('week')
      .toDate();
    let endOfWeek = moment()
      .endOf('week')
      .toDate();

    const firstDate = moment(new Date(startOfWeek)).format('MM/DD/YY');
    const lastDate = moment(new Date(endOfWeek)).format('MM/DD/YY');
    this.CurrentdateRange = firstDate + '-' + lastDate;
    } else if (data.index == 2) {
      this.month = true;
      var date = new Date();
    var first_date = new Date(date);
    first_date.setUTCDate(1);
    var last_date = new Date(first_date);
    last_date.setUTCMonth(last_date.getUTCMonth() + 1);
    last_date.setUTCDate(0);
    const firstDate = moment(first_date.toJSON().substring(0, 10)).format(
      'MM/DD/YY'
    );
    const lastDate = moment(last_date.toJSON().substring(0, 10)).format(
      'MM/DD/YY'
    );
    this.CurrentdateRange = firstDate + '-' + lastDate;
    } else if (data.index == 3) {
      this.quarter = true;
      let today = new Date();
    let firstDate:any ='';
    let lastDate:any ='';
    let quarter = moment(today).quarter();
    if(quarter === 1){
        firstDate = moment(new Date(today.getFullYear(), 0 , 1)).format('MM/DD/YY');
        lastDate = moment(new Date(today.getFullYear(), 2 , 31)).format('MM/DD/YY');
    }else if(quarter === 2){
      firstDate = moment(new Date(today.getFullYear(), 3 , 1)).format('MM/DD/YY');
      lastDate = moment(new Date(today.getFullYear(), 5  , 30)).format('MM/DD/YY');

    }else if(quarter === 3){
      firstDate = moment(new Date(today.getFullYear(), 6 , 1)).format('MM/DD/YY');
      lastDate = moment(new Date(today.getFullYear(), 8  , 30)).format('MM/DD/YY');
    }else if(quarter === 4){
      firstDate = moment(new Date(today.getFullYear(), 9 , 1)).format('MM/DD/YY');
      lastDate = moment(new Date(today.getFullYear(), 11  , 31)).format('MM/DD/YY');
    }
    this.CurrentdateRange = firstDate + '-' + lastDate;
    } else if (data.index == 4) {
      let firstDate = moment(
        new Date(new Date().getFullYear(), 0, 1)
      ).format('MM/DD/YY');
      let lastDate = moment(
        new Date(new Date().getFullYear(), 11, 31)
      ).format('MM/DD/YY');
      this.CurrentdateRange = firstDate + '-' + lastDate;
      this.year = true;
    } else if (data.index == 5) {
      this.CurrentdateRange = this.currentValue;

      this.dateRange = true;
    }
  }
  // Search Flow
  searchingFor: string = 'people';
  tagsArr = [];
  focusList: number = -1;
  agentList: Array<object> = [];
  group_data: Array<string> = [];
  tagList: Array<string> = [];
  recordingList: Array<object> = [];
  searchedArr: any = [];
  isSearching: boolean = false;
  originalArray: any = [];
  isLoading: boolean = false;
  searchingKeyword: boolean = false;
  @ViewChild('listContainer') container: ElementRef;
  onUpDown(e: KeyboardEvent) {
    // e.preventDefault();
    let list: any;
    let element: string = '';
    if (this.searchingFor === 'recordings') {
      list = this.recordingList.length;
      element = '#recordings_';
    } else if (this.searchingFor === 'tags') {
      list = this.tagsArr.length;
      element = '#tags_';
    } else if (this.searchingFor === 'people') {
      list = this.searchedArr.length;
      element = '#people_';
    }
    if (e.code === 'ArrowDown') {
      let count = this.focusList + 1;
      if (count === list) {
        return;
      }
      this.focusList++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList - 1;
      if (count === -1) {
        return;
      }
      this.focusList--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
      if (this.searchingFor === 'people') {
        let i = this.searchedArr[this.focusList]?.name;
        if (i) {
          this.seachInput.nativeElement.value = i;
          this.filterRecordigns(i);
        } else {
          return;
        }
      } else if (this.searchingFor === 'tags') {
        let i = this.tagsArr[this.focusList];
        if (i) {
          this.seachInput.nativeElement.value = i;
          this.filterRecordigns(i);
        } else {
          return;
        }
      } else if (this.searchingFor === 'recordings') {
        let i = this.recordingList[this.focusList];
        if (i) {
          this.seachInput.nativeElement.value = i;
          this.filterRecordigns(i);
        }
      }
    }
  }



  logOut(): void {
    this.auth.logout();
  }

  switchUser(){
    localStorage.removeItem('userInfo')
    localStorage.removeItem('Selected_Group')
    localStorage.removeItem('buildTree')
    localStorage.removeItem('groupsTree')
    localStorage.removeItem('logo')
    localStorage.removeItem('athena_refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('athena_access_token')
    localStorage.removeItem('groups');
    localStorage.setItem('token', localStorage.getItem('admin_token'));
    this.router.navigate(['/administrator'])
  }
  searchUsers(e: string) {
    this.searchValue = e;
    if(this.searchValue.length > 0){
      this.isListOpen = true;
    }else{
      this.isListOpen = false;
    }
    if (e === '') {
      this.searchedArr.length = 0;
      return;
    }
    if (this.searchingFor === 'people') {
      this.searchedArr = this.agentList.filter((item: any) => {
        let i = item.name.slice(0, e.length).toLowerCase();
        if (i === e.toLowerCase()) {
          return item;
        }
      });
    }

    if (this.searchingFor === 'tags') {
      this.tagsArr = this.tagList.filter((item: any) => {
        let i = item.slice(0, e.length).toLowerCase();
        if (i === e.toLowerCase()) {
          return item;
        }
      });
    }
  }
  results$: Observable<any>;
  subject = new Subject();
  isListOpen :boolean = false;
  searchRecordings(e) {
    if(this.searchValue.length > 0){
      this.isListOpen = true;
    }else{
      this.isListOpen = false;
    }
    this.subject.next(e);
    this.searchingKeyword = true;
  }
  @ViewChild('seachInput') seachInput: ElementRef;
  agentSelected(e) {
    this.seachInput.nativeElement.value = e.name;
  }
  clearSeaching() {
    // this.seachInput.nativeElement.value = '';
    this.searchedArr.length = 0;
    this.tagsArr.length = 0;
    this.recordingList.length = 0;
    this.focusList = -1;
  }
  renderList: any = undefined;
  loading: boolean = false;
  searchValue: string = '';
  filterRecordigns(e) {
    this.listOfRecording.searchedFor = this.searchingFor;
    this.isLoading = true;
    this.isSearching = false;
    let keyword: string = e;
    this.searchValue = e;
    let type = '';
    if (this.searchingFor === 'recordings') {
      type = 'recording';
    } else if (this.searchingFor === 'people') {
      type = 'agent';
    } else if (this.searchingFor === 'tags') {
      type = 'tag';
    }
    let data = { type: type, filter: keyword };
    this.listOfRecording.getSearchedArray(data).subscribe(res => {
      this.listOfRecording.filterLists.next(res);
      this.renderList = res;
      this.listOfRecording.searchedKeyword = e;
      this.router.navigate(['/admin/recordings']);
      this.isLoading = false;
    });
  }
  clearFilterList() {
    this.searchValue = '';
    this.renderList = this.originalArray;
    this.loading = false;
    this.isListOpen = false;
    this.seachInput.nativeElement.value = '';
    this.searchedArr = [];
    this.tagsArr = [];
    this.recordingList = [];
    this.focusList = -1;
  }
  // Calendar
  selectedDouble : any
  duplicateDate : any;
  changedouble(e){
    if(!e.startDate){
      setTimeout(() => {
        this.selectedDouble = {startDate : null, endDate : null};
        this.selectedDouble = {startDate : moment(), endDate : moment().add(1, 'month').endOf('month')};
      }, 50);
      setTimeout(() => {

        this.selectedDouble = {startDate : moment(), endDate : moment()};
      }, 50);
    }

    this.duplicateDate = moment(e.startDate?._d).format('MM/DD/YY') + '-' + moment(e.endDate?._d).format('MM/DD/YY');
    this.currentValue = moment(e.startDate?._d).format('MM/DD/YY') + '-' + moment(e.endDate?._d).format('MM/DD/YY');
    this.CurrentdateRange = this.currentValue;
  }

  ngOnDestroy(){
    this.profileService.currentTab = 0;
    this.dashboardService.renderGroupData.next(undefined);
    this.dashboardService.currentGroupNames = 'All';
  }
  classificationDropdown: any;
  showTick1: number = -1;
  currentGroup:any = 'All Groups'


  isAnyGroup : boolean = false;
  onApplyGroups(item : any) {
   console.log(item)
    this.dashboardService.currentDropdownItem = 0;

    // localStorage.setItem('selectedNodes', JSON.stringify(this.checklistSelection.selected));
    // localStorage.setItem('Selected_Group', JSON.stringify(item));
    this.getGroups();
    // this.GroupDataLoading = true;
    this.dashboardService.groupDataLoading.next(true);
    if(!this.currentTab){
      this.currentTab = 0;
    }
    this.hideTab(this.currentTab);
    this.modalService.dismissAll();
    this.dashboardService.currentGroupNames = this.newCurrentArr;
    this.classificationDropdown = false;
    setTimeout(() => {
      this.getdate({index:this.currentTab})
      this.currentGroup = this.newCurrentArr.length + ' Groups'
      this.GroupDataLoading = false;
      // })
    }, 500);
  }
  onApplyGroupsS(item : any) {
    console.log(item)
    // localStorage.setItem('selectedNodes', JSON.stringify(this.checklistSelection.selected));
    this.dashboardService.currentDropdownItem = 0;
    this.isAnyGroup = false;
    if(this.checklistSelection.selected.length === 0){
      this.isAnyGroup = true;
      return
    }

    // localStorage.setItem('selectedNodes', JSON.stringify(this.checklistSelection.selected));

    // this.getGroups();
    // this.GroupDataLoading = true;
    this.dashboardService.groupDataLoading.next(true);
    if(!this.currentTab){
      this.currentTab = 0;
    }
    this.hideTab(this.currentTab);
    this.modalService.dismissAll();
    this.dashboardService.currentGroupNames = this.newCurrentArr;
    this.classificationDropdown = false;
    setTimeout(() => {
      this.getdate({index:this.currentTab})
      // this.currentGroup = this.newCurrentArr.length + ' Groups'
      this.GroupDataLoading = false;
      // })
    }, 500);

  }
  hideTab(e:number):void{
    if(e === 0){
      this.today = false;
    }
    else if(e === 1){
      this.week = false;
    }
    else if(e === 2){
      this.month = false;
    }
    else if(e === 3){
      this.quarter = false;
    }
    else if(e === 4){
      this.year = false;
    }
    else if(e === 5){
      this.dateRange = false;
    }
  }
  openScrollableContent(longContent) {
    this.modalService.open(longContent, { scrollable: true });
  }




// ======================================================







  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };


  getLevel = (node: TreeItemFlatNode) => node.level;

  isExpandable = (node: TreeItemFlatNode) => node.expandable;

  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TreeItemFlatNode): void {
    // this.checklistSelection.toggle(node);
    // const descendants = this.treeControl.getDescendants(node);
    // this.checklistSelection.isSelected(node)
    //   ? this.checklistSelection.select(...descendants)
    //   : this.checklistSelection.deselect(...descendants);
  }
  clicked_node: TodoItemFlatNode | null;
  clicked_num = 0;
  saveSelectedNodes(node: TodoItemFlatNode, e: any): void {

  const descendants = this.treeControl.getDescendants(node);

  if (!this.checklistSelection.isSelected(node)) {
    this.clicked_node = node;
    this.checklistSelection.select(node);
    this.allNodes.push(node.item)
  } else {
    if (this.clicked_num === 0 && this.checklistSelection.isSelected(node) && this.clicked_node) {
       console.log('first');
      e.source._checked = true
      e.checked = true
      this.checklistSelection.select(node);
      this.clicked_num = 1;
      this.checklistSelection.select(...descendants)
      descendants.forEach(i=>{
        this.allNodes.push(i.item)
      })
    } else {
      // third-selection, deselect parent & all children
      this.clicked_node = null;
      this.clicked_num = 0;
      this.checklistSelection.deselect(node);
      this.checklistSelection.deselect(...descendants);
      let removal: any = []
      descendants.filter(i =>{
        removal.push(i.item)
      }
      )
      removal.push(node.item);
      removal.forEach(el => {
        this.allNodes = this.allNodes.filter(item=>{
          if (el !== item){
            return item
          }
        });
      })
    }

  }

  // this.checklistSelection.toggle(node);
  //   this.checklistSelection.isSelected(node)
  //     ? this.checklistSelection.select(...descendants)
  //     : this.checklistSelection.deselect(...descendants);
  //   descendants.forEach(child => this.checklistSelection.isSelected(child));
  //   this.checkAllParentsSelection(node);
  }


  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */


  /* Checks all the parents when a leaf node is selected/unselected */

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
      this.allNodes = this.allNodes.filter(item=>{
        if(item !== node.item){
          return item
        }
      })
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
      this.allNodes.push(node.item)
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this._database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this._database.updateItem(nestedNode!, itemValue);
  }
  allNodes : string[] = []
  checkAll(){
    let arr : Array<any> = JSON.parse(localStorage.getItem('selectedNodes'));
    this.allNodes  = [];
    this.treeControl.expand(this.treeControl.dataNodes[0])

    if(arr){
      console.log('Array',arr)
      console.log('this.checklistSelection',this.checklistSelection)

      for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
        this.allNodes.push(this.treeControl.dataNodes[i].item);
        if(arr.find(item => item.item === this.treeControl.dataNodes[i].item)){
          if(!this.checklistSelection.isSelected(this.treeControl.dataNodes[i])){
            this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
            this.treeControl.expand(this.treeControl.dataNodes[i])
            // this.treeControl.expandAll(this.treeControl.dataNodes[i]);

          }
        }
        // this.treeControl.expand(this.treeControl.dataNodes[i])
      }
    }else{
      for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
        this.allNodes.push(this.treeControl.dataNodes[i].item);
          if(!this.checklistSelection.isSelected(this.treeControl.dataNodes[i])){
            this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
          }
      }
    }
    // localStorage.setItem('Selected_Group', JSON.stringify(this.checklistSelection.selected))
  }
  newCurrentArr = []
  getGroups(){

    this.newCurrentArr = [];
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if(this.checklistSelection.isSelected(this.treeControl.dataNodes[i])){
        // if(this.treeControl.dataNodes[i].level > 0){
          // console.log('Get groups',this.treeControl.dataNodes[i].item)
          this.newCurrentArr.push(this.treeControl.dataNodes[i].item);
        // }
      }
    }
    // localStorage.setItem('Selected_Group', JSON.stringify(this.newCurrentArr));
  }
  checkAll1(){
    this.checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      let isNode =  this.allNodes.find(item => item === this.treeControl.dataNodes[i].item)
      if(isNode){
        this.checklistSelection.select(this.treeControl.dataNodes[i]);
       }
      this.treeControl.expand(this.treeControl.dataNodes[i])
    }
  }
  currentText : any = '';
  filterChanged(filterText: string) {
    this.currentText = filterText
    this.filter(filterText);
    if(filterText)
    {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
      this.treeControl.expand(this.treeControl.dataNodes[0])
      // this.treeControl.expandAll();
    }
  }
  buildFileTree(obj: any[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code)?.startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        const children = obj.filter(so => (<string>so.code)?.startsWith(level + '.'));
        if (children && children.length > 0) {
          node.children = this.buildFileTree(children, o.code);
        }
        return node;
      });
  }

  treeData: any[] = []
  filteredTreeData;

  public filter(filterText: string) {
    if (filterText) {
      this.filteredTreeData = this.treeData.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      Object.assign([], this.filteredTreeData).forEach(ftd => {
        let str = (<string>ftd.code);
        while (str?.lastIndexOf('.') > -1) {
          const index = str?.lastIndexOf('.');
          str = str?.substring(0, index);
          if (this.filteredTreeData.findIndex(t => t.code === str) === -1) {
            const obj = this.treeData.find(d => d.code === str);
            if (obj) {
              this.filteredTreeData.push(obj);
            }
          }
        }
        if(ftd.code.split(".").length == 3){
          const matches = this.treeData.filter(element => {
            if (element.code.includes(<string>ftd.code + ".")) {
              return true;
            }
          });
          this.filteredTreeData = this.filteredTreeData.concat(matches);
        }
      });
    } else {
      this.filteredTreeData = this.treeData;
    }

    const unique = (value, index, self) => {
      return self.indexOf(value) === index
    }
    this.filteredTreeData = this.filteredTreeData.filter(unique)
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    const data = this.buildFileTree(this.filteredTreeData, '0');
    // Notify the change.
    this._database.dataChange.next(data);
    this.checkAll();
  }
}

export class TreeItemNode {
  children: TreeItemNode[];
  item: string;
  code: string;
}
export class TreeItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  code?: string;
}
