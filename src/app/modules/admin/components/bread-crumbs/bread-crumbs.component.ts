import { Component,Output, ElementRef, EventEmitter, Injectable, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { RecordingLists } from 'src/app/_services/recordingList';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { profileService } from 'src/app/_services/profile';
import { number } from '@amcharts/amcharts4/core';
interface FoodNode {
  name: string;
  children?: FoodNode[];
}
let PERMISSION_TREE = []
let TREE_DATA = [];
let TREE_DATAC = [];
let ArrayFullMain = []

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
  code?: any
  isSelected?: any
  id?: any
  isDisabled?: boolean
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  code?: string
  isSelected?: boolean
  id?: any
  isDisabled?: boolean
}
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  dataChangePermission = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }


  get dataPermission(): TodoItemNode[] {
    console.log(this.dataChangePermission.value);

    return this.dataChangePermission.value;
  }

  constructor() {
    // this.initialize();
  }

  initialize() {
    this.treeData = TREE_DATA;
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.

    const data = this.buildFileTree(TREE_DATA, '0');
    // const data1 = this.buildFileTreeB(TREE_DATA, '0');


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
        node.id = o.id;
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
    this.dataChange.next(data);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  treeDataPermission: any[] = []

}

@Component({
  selector: 'app-bread-crumbs',
  templateUrl: './bread-crumbs.component.html',
  styleUrls: ['./bread-crumbs.component.scss'],
  providers: [ChecklistDatabase],
})
export class BreadCrumbsComponent implements OnInit {
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  selectedParent: TodoItemFlatNode | null = null;
  newItemName = '';
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSourceTree: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);


  subgroups: boolean = true;
  userData: any;
  isAdmin: boolean=false;
  countlevel1 : number = 0;
  isSearching : boolean = false;
  searchingKeyword : boolean = false;
  isLoading: boolean = false;
  searchingFor: string = 'people';
  searchedArr: any = [];
  originalArray: any = [];

  allNodesB: any[] = []
  allNodes: any[] = []
  tagsArr = []
  focusList : number = -1
  agentList: Array<object> = [];
  tagList: Array<string> = [];
  recordingList: Array<string> = [];
  loading: boolean=false;
  main_group: any;
  selectGroupName: any;
  listFor: any;
  filterGroupID: any;
  // currentGroup:any = localStorage.getItem('Current_Groups') ? localStorage.getItem('Current_Groups') : 'All Groups'
  treeDataB: any[];
  parent: any;
  breadText: string = '';

  filteredTreeDataB: any[];
  hideSubGroupButton: boolean;
  findSecondLevel: string;
  isThirdAccDropdown: boolean;
  isTableLoading: boolean;
  users: boolean;
  isMainAccDropdown: boolean;
  selectedThiLevelGroup: string;
  DuplicatethirdLevelSubGroups: any;
  thirdLevelSubGroups: any;
  DuplicateSecondLevelSubGroups: any;
  currentSubGroups: any;
  findThirdLevel: string;
  treeData: any[];
  breadText1: string = '';
  filteredTreeData: any[];
  treeDataC: any;
  clicked_num: number;
  clicked_node: TodoItemFlatNode;
  filteredTreeDataA: any[];
  countLevel3: number = 0 ;
  isAnyGroup: boolean=false;

    constructor(
      private teams: profileService,
      private _database: ChecklistDatabase,
      private modalService: NgbModal,
      private auth: AuthenticationService,
       private router: Router,
    public listOfRecording : RecordingLists,
    private elm: ElementRef,


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
  ngOnInit(): void {
     this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    if(localStorage.getItem('adminInfo')){
      this.isAdmin = true;
  }else{
    this.isAdmin =false;
  }
  ArrayFullMain = JSON.parse(localStorage.getItem('selectedNodes'))
  ArrayFullMain?.map((item)=>{

    if(item.level == 1 ){

      this.countlevel1 += 1
    }
    if(item.level == 2){
      this.countLevel3 += 1
    }
  })
  console.log(this.countlevel1,this.countLevel3)
  this.main_group = JSON.parse(localStorage.getItem('main_group')) || {id : 0, name : ''};
  console.log('this.main_group',this.main_group)
    this.selectGroupName = this.main_group.name;
    this.listFor = this.main_group.name;
    this.filterGroupID = this.main_group.id;
    // this.getUsers(this.main_group.id, 'second');


      TREE_DATA = JSON.parse(localStorage.getItem('groups'));
      console.log(TREE_DATA)
      console.log('saagh')
      if(TREE_DATA){
        this.treeData = TREE_DATA;
        this._database.initialize();
        this.checkAll()

        // this.totalGroupSelected = this.newCurrentArr.length + ' Groups selected';
      }
  }


  @Output() newItemEvent = new EventEmitter<any>();
  @Output() newItemEventNew = new EventEmitter<any>();
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
 openScrollableContent(longContent) {
    this.modalService.open(longContent, { scrollable: true });
  }

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

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
  newCurrentArr = []

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
  // loading: boolean = false;
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
      // this.router.navigate(['/admin/recordings'])
      this.listOfRecording.isRecordingDetail.next(false);
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

  getLevel = (node: TreeItemFlatNode) => node.level;

  isExpandable = (node: TreeItemFlatNode) => node.expandable;

  isSelected = (node: TreeItemFlatNode) => node.isSelected;

  isID = (node: TreeItemFlatNode) => node.id;

  isDisabled = (node: TreeItemFlatNode) => node.isDisabled;


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
    flatNode.isSelected = node.isSelected;
    flatNode.isDisabled = node.isDisabled;
    flatNode.id = node.id;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }



  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */




  /** Whether part of the descendants are selected */

  /** Toggle the to-do item selection. Select/deselect all the descendants node */


  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */


  /* Checks all the parents when a leaf node is selected/unselected */

  todoLeafItemSelectionToggle(node: TodoItemFlatNode, e): void {
    if(e){
      this.allNodes.push(node.item);
    }else{
      this.allNodes = this.allNodes.filter(item=>{
        if(node.item !== item){
          return item;
        }
      })
    }
    this.checklistSelection.toggle(node);
    // this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    console.log('parent',parent)
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }
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
  /** Check root node checked state and change it accordingly */

  // allNodes : Array<any> = []
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
  checkAll1(){
    this.checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      let isNode =  this.allNodes.find(item => item === this.treeControl.dataNodes[i].item)
      if(isNode){
        this.checklistSelection.select(this.treeControl.dataNodes[i]);
       }
      // this.treeControl.expand(this.treeControl.dataNodes[i])
    }
  }

// filterChanged(filterText: string) {
//   console.log()
//   this.breadText1 = filterText;
//   this.filter(filterText);
//   if (filterText) {
//     this.treeControl.expandAll();
//   } else {
//     this.treeControl.collapseAll();
//     this.treeControl.expand(this.treeControlB.dataNodes[0]);
//     if(this.parent){
//       this.treeControl.expand(this.parent);
//     }
//     // this.treeControl.expandAll();
//   }
// }


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
  this.checkAll1();
}
  unCheckAll() {
    this.newCurrentArr = [];
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if (this.checklistSelection.isSelected(this.treeControl.dataNodes[i])) {
        this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
      }
    }
  }

  groupLevel2 : string =JSON.parse(localStorage.getItem('Group_Level2'));
  groupLevel3 : string =localStorage.getItem('Group_Level3')

  isOneGroupSelected : boolean = false;
  currentGroupNode : any=localStorage.getItem('Current_Groups')
  NewEmitGroups(){
   this.countlevel1 = 0
   this.countLevel3 = 0
    let Array = [];
    let ArrayFull = [];
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if (this.checklistSelection.isSelected(this.treeControl.dataNodes[i])) {
       let NewItem =  this.treeControl.dataNodes[i]
       Array.push(NewItem.item)
       ArrayFull.push(NewItem)
      }
    }
    console.log(Array)
    console.log(ArrayFull)
    ArrayFull.map((item)=>{
      console.log(item.level)

      if(item.level == 1 ){

        this.countlevel1 += 1
      }
      if(item.level == 2){
        this.countLevel3 += 1
      }
    })
    console.log(this.countlevel1,this.countLevel3)
    console.log(this.checklistSelection.selected)
    localStorage.setItem('selectedNodes', JSON.stringify(this.checklistSelection.selected));

    localStorage.setItem('Selected_Group', JSON.stringify(Array));

    // this.currentGroup = localStorage.getItem('Current_Groups')
    this.isAnyGroup = false;
    if(this.checklistSelection.selected.length === 0){
      this.isAnyGroup = true;
      return
    }
    this.newItemEvent.emit();
  }



  getUsers(name:number, type ?: string){
    this.isTableLoading = true;
    this.subgroups = true;
    this.users = false;
    if(type == 'second'){

      this.teams.secondLevelUsers(name).subscribe((res : any)=>{
        console.log(res);
        if(res.status === 'success'){
          // this.populateData(res);
          // this.hideGroupsTab = false;
          // this.users = false;
          this.currentSubGroups = res.data.subgroups
          this.DuplicateSecondLevelSubGroups = res.data.subgroups
          this.isTableLoading = false;
        }
      })
    }else{
      this.teams.secondLevelUsers(name).subscribe((res : any)=>{
        console.log(res);
        if(res.status === 'success'){
          // this.populateData(res);
          // this.hideGroupsTab = false;
          // this.users = false;
          this.thirdLevelSubGroups = res.data.subgroups
          this.DuplicatethirdLevelSubGroups = res.data.subgroups;
          this.isTableLoading = false;
        }
      })
      this.selectedThiLevelGroup = ''
    }
    this.isMainAccDropdown = false;
    // this.findThirdLevel = '';
    // this.findSecondLevel = '';
  }

  thirdLevelUsers(name){
    this.isTableLoading = true;
    this.teams.secondLevelUsers(name).subscribe((res:any)=>{
      // this.hideGroupsTab = true
      // this.subgroups = false;
      this.users = true;
      console.log(res);
      // this.populateData(res);
      this.isTableLoading = false;
    });
    this.isThirdAccDropdown= false
  }
  onSecondLevelGroup(e: string) {
    this.findSecondLevel = e
    let keyword = e.toLowerCase();
    this.currentSubGroups = this.DuplicateSecondLevelSubGroups.filter(item => {
      let i = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
  }
  onThirdLevelGroup(e: string) {
    this.findThirdLevel = e
    let keyword = e.toLowerCase();
    this.thirdLevelSubGroups = this.DuplicatethirdLevelSubGroups.filter(item => {
      let i = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
  }
}

export class TreeItemNode {
  children: TreeItemNode[];
  item: string;
  code: string;
  id?: any
  isSelected?: boolean
  isDisabled?: boolean
}
export class TreeItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  code?: string;
  id?: any
  isSelected?: boolean
  isDisabled?: boolean
}
