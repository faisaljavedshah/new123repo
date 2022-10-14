import {
  Component,
  ElementRef,
  Injectable,
  OnInit,
  HostListener,
  ViewChild,
} from '@angular/core';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthenticationService, profileService } from 'src/app/_services';
import { GroupsUsersService } from 'src/app/_services/groups-users.service';
import { RecordingLists } from 'src/app/_services/recordingList';
import * as moment from 'moment';
import { CombineLatestSubscriber } from 'rxjs/internal/observable/combineLatest';
import { Router } from '@angular/router';
// import { Console } from 'console';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}
let PERMISSION_TREE = []
let TREE_DATA = []

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
    this.treeData= TREE_DATA;
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.

    const data = this.buildFileTree(TREE_DATA, '0');
    // Notify the change.
    this.dataChange.next(data);
  }
  initializePermission() {
    this.treeDataPermission = PERMISSION_TREE;
    const data = this.buildFileTreePermission(PERMISSION_TREE, '0');
    this.dataChangePermission.next(data);
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


  buildFileTreePermission(obj: any[], level: string): TreeItemNode[]  {
    return obj.filter(o =>
      (<string>o.code)?.startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        // console.log(o);

        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        node.id = o.id;
        node.isSelected = o.isSelected;
        node.isDisabled = o.isDisabled;
        const children = obj.filter(so => (<string>so.code)?.startsWith(level + '.'));
        if (children && children.length > 0) {
          node.children = this.buildFileTreePermission(children, o.code);
        }
        return node;
      });
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
  treeData: any[] = []
  treeDataPermission: any[] = []
  filteredTreeData;
  public filter(filterText: string) {
    if (filterText) {
      this.filteredTreeData = this.treeData.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      Object.assign([], this.filteredTreeData).forEach(ftd => {
        let str = (<string>ftd.code);
        while (str.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);
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
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  providers: [ChecklistDatabase],
})
export class GroupsComponent implements OnInit {
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  selectedParent: TodoItemFlatNode | null = null;
  newItemName = '';
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSourceTree: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  tagsArr = []
  focusList : number = -1
  agentList: Array<object> = [];
  tagList: Array<string> = [];
  recordingList: Array<string> = [];
  loading: boolean=false;

  flatNodeMapB = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMapB = new Map<TodoItemNode, TodoItemFlatNode>();
  selectedParentB: TodoItemFlatNode | null = null;
  newItemNameB = '';
  treeControlB: FlatTreeControl<TodoItemFlatNode>;
  treeFlattenerB: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSourceTreeB: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  checklistSelectionB = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  subgroups: boolean = true;
  Groupaccess: boolean = true;
  Reportingaccess: boolean = false;
  Audioscoring: boolean = false;
  status = 0;
  users: boolean;
  IconSubgroup: boolean = true;
  subGroupTooltip: boolean = false;
  UserTooltip: boolean = false;
  IconUser: boolean = false;
  isSearching : boolean = false;
  issPaginationDropdown1: boolean;


  searchingKeyword : boolean = false;
  isLoading: boolean = false;
  searchingFor: string = 'people';
  searchedArr: any = [];
  originalArray: any = [];

  groupdropdown = false;
  grouprole = false;
  currentGROUP = '';
  groupindustry = false;
  currentmanager = ''
  currentLanguage = 'Convirza Orlando';
  currentState :any= ''
  currentParent = ''
  isDateDropdown5 = false;
  activate: boolean = false;
  activated: boolean = true;
  isactivated: boolean = true;
  hideSubGroupButton: boolean = false;
  isStateDropdown = false;
  isparentDropdown = false;
  isreel = false
  currentReel = ''
  closeModal: string;
  GroupLoading: boolean = true;
  public showwPassword: boolean;
  public showpPasswordd: boolean = false;
  managerNameList: Array<any> = [
    { id :'1', name : 'Digital'},
    { id :'2', name : 'Direct'},
    { id :'3', name : 'Dealership'},
    { id :'4', name : 'Service'},
    { id :'5', name : 'Insurance'},
    { id :'6', name : 'Mortgage'},
    { id :'7', name : 'Electrician'},
    { id :'8', name : 'Home Improvement'},
    { id :'9', name : 'Housekeeping'},
    { id :'10', name : 'Pest Control'},
    { id :'11', name : 'Plumber/HVAC'},
    { id :'12', name : 'Accomodations'},
    { id :'13', name : 'Travel Agency'},
    { id :'14', name : 'Chiropractor'},
    { id :'15', name : 'Cosmetic'},
    { id :'16', name : 'Dental'},
    { id :'17', name : 'Home Healthcare'},
    { id :'18', name : 'Other'},
    { id :'19', name : 'Gym/Fitness'},
    { id :'20', name : 'Spa'},
    { id :'21', name : 'Property Management'},
    { id :'22', name : 'Sales'},
    { id :'23', name : 'Furniture/Electronics'},
    { id :'24', name : 'Heavy Equipment'},
    { id :'25', name : 'Party/Event'},
    { id :'26', name : 'Other'},
    { id :'27', name : 'Other'},
    { id :'28', name : 'Institution'},
    { id :'29', name : 'Marketing'},
  ]
  duplicateMangagers: Array<any> = [
    { id :'1', name : 'Digital'},
    { id :'2', name : 'Direct'},
    { id :'3', name : 'Dealership'},
    { id :'4', name : 'Service'},
    { id :'5', name : 'Insurance'},
    { id :'6', name : 'Mortgage'},
    { id :'7', name : 'Electrician'},
    { id :'8', name : 'Home Improvement'},
    { id :'9', name : 'Housekeeping'},
    { id :'10', name : 'Pest Control'},
    { id :'11', name : 'Plumber/HVAC'},
    { id :'12', name : 'Accomodations'},
    { id :'13', name : 'Travel Agency'},
    { id :'14', name : 'Chiropractor'},
    { id :'15', name : 'Cosmetic'},
    { id :'16', name : 'Dental'},
    { id :'17', name : 'Home Healthcare'},
    { id :'18', name : 'Other'},
    { id :'19', name : 'Gym/Fitness'},
    { id :'20', name : 'Spa'},
    { id :'21', name : 'Property Management'},
    { id :'22', name : 'Sales'},
    { id :'23', name : 'Furniture/Electronics'},
    { id :'24', name : 'Heavy Equipment'},
    { id :'25', name : 'Party/Event'},
    { id :'26', name : 'Other'},
    { id :'27', name : 'Other'},
    { id :'28', name : 'Institution'},
    { id :'29', name : 'Marketing'},
  ]
  State: Array<any> = [
    { id :'AK', name : 'Alaska'},
    { id :'HI', name : 'Hawaii'},
    { id :'CA', name : 'California'},
    { id :'NV', name : 'Nevada'},
    { id :'OR', name : 'Oregon'},
    { id :'WA', name : 'Washington'},
    { id :'AZ', name : 'Arizona'},
    { id :'CO', name : 'Colorado'},
    { id :'ID', name : 'Idaho'},
    { id :'MT', name : 'Montana'},
    { id :'NE', name : 'Nebraska'},
    { id :'NM', name : 'New Mexico'},
    { id :'ND', name : 'North Dakota'},
    { id :'UT', name : 'Utah'},
    { id :'WY', name : 'Wyoming'},
    { id :'AL', name : 'Alabama'},
    { id :'AR', name : 'Arkansas'},
    { id :'IL', name : 'Illinois'},
    { id :'IA', name : 'Iowa'},
    { id :'KS', name : 'Kansas'},
    { id :'KY', name : 'Kentucky'},
    { id :'LA', name : 'Louisiana'},
    { id :'MN', name : 'Minnesota'},
    { id :'MS', name : 'Mississippi'},
    { id :'MO', name : 'Missouri'},
    { id :'OK', name : 'Oklahoma'},
    { id :'SD', name : 'South Dakota'},
    { id :'TS', name : 'Texas'},
    { id :'TN', name : 'Tennessee'},
    { id :'WI', name : 'Wisconsin'},
    { id :'CT', name : 'Connecticut'},
    { id :'DE', name : 'Delaware'},
    { id :'FL', name : 'Florida'},
    { id :'GA', name : 'Georgia'},
    { id :'IN', name : 'Indiana'},
    { id :'ME', name : 'Maine'},
    { id :'MD', name : 'Maryland'},
    { id :'MA', name : 'Massachusetts'},
    { id :'MI', name : 'Michigan'},
    { id :'NH', name : 'New Hampshire'},
    { id :'NJ', name : 'New Jersey'},
    { id :'NY', name : 'New York'},
    { id :'NC', name : 'North Carolina'},
    { id :'OH', name : 'Ohio'},
    { id :'PA', name : 'Pennsylvania'},
    { id :'RI', name : 'Rhode Island'},
    { id :'SC', name : 'South Carolina'},
    { id :'VT', name : 'Vermont'},
    { id :'VA', name : 'Virginia'},
    { id :'WV', name : 'West Virginia'},

  ]
  regionCanada : Array<any> = [
  { id :'AB', name : 'Alberta'},
  { id :'BC', name : 'British Columbia'},
  { id :'MB', name : 'Manitoba'},
  { id :'NB', name : 'New Brunswick'},
  { id :'NF', name : 'Newfoundland'},
  { id :'NT', name : 'Northwest Territories'},
  { id :'NS', name : 'Nova Scotia'},
  { id :'ON', name : 'Ontario'},
  { id :'PE', name : 'Prince Edward Island'},
  { id :'QC', name : 'Quebec'},
  { id :'SK', name : 'Saskatchewan'},
  { id :'YT', name : 'Yukon'},
]
regionCanadaDuplicate : Array<any> = [
  { id :'AB', name : 'Alberta'},
  { id :'BC', name : 'British Columbia'},
  { id :'MB', name : 'Manitoba'},
  { id :'NB', name : 'New Brunswick'},
  { id :'NF', name : 'Newfoundland'},
  { id :'NT', name : 'Northwest Territories'},
  { id :'NS', name : 'Nova Scotia'},
  { id :'ON', name : 'Ontario'},
  { id :'PE', name : 'Prince Edward Island'},
  { id :'QC', name : 'Quebec'},
  { id :'SK', name : 'Saskatchewan'},
  { id :'YT', name : 'Yukon'},
]
  duplicateState: Array<any> = [
    { id :'AK', name : 'Alaska'},
    { id :'HI', name : 'Hawaii'},
    { id :'CA', name : 'California'},
    { id :'NV', name : 'Nevada'},
    { id :'OR', name : 'Oregon'},
    { id :'WA', name : 'Washington'},
    { id :'AZ', name : 'Arizona'},
    { id :'CO', name : 'Colorado'},
    { id :'ID', name : 'Idaho'},
    { id :'MT', name : 'Montana'},
    { id :'NE', name : 'Nebraska'},
    { id :'NM', name : 'New Mexico'},
    { id :'ND', name : 'North Dakota'},
    { id :'UT', name : 'Utah'},
    { id :'WY', name : 'Wyoming'},
    { id :'AL', name : 'Alabama'},
    { id :'AR', name : 'Arkansas'},
    { id :'IL', name : 'Illinois'},
    { id :'IA', name : 'Iowa'},
    { id :'KS', name : 'Kansas'},
    { id :'KY', name : 'Kentucky'},
    { id :'LA', name : 'Louisiana'},
    { id :'MN', name : 'Minnesota'},
    { id :'MS', name : 'Mississippi'},
    { id :'MO', name : 'Missouri'},
    { id :'OK', name : 'Oklahoma'},
    { id :'SD', name : 'South Dakota'},
    { id :'TS', name : 'Texas'},
    { id :'TN', name : 'Tennessee'},
    { id :'WI', name : 'Wisconsin'},
    { id :'CT', name : 'Connecticut'},
    { id :'DE', name : 'Delaware'},
    { id :'FL', name : 'Florida'},
    { id :'GA', name : 'Georgia'},
    { id :'IN', name : 'Indiana'},
    { id :'ME', name : 'Maine'},
    { id :'MD', name : 'Maryland'},
    { id :'MA', name : 'Massachusetts'},
    { id :'MI', name : 'Michigan'},
    { id :'NH', name : 'New Hampshire'},
    { id :'NJ', name : 'New Jersey'},
    { id :'NY', name : 'New York'},
    { id :'NC', name : 'North Carolina'},
    { id :'OH', name : 'Ohio'},
    { id :'PA', name : 'Pennsylvania'},
    { id :'RI', name : 'Rhode Island'},
    { id :'SC', name : 'South Carolina'},
    { id :'VT', name : 'Vermont'},
    { id :'VA', name : 'Virginia'},
    { id :'WV', name : 'West Virginia'},
  ]
  options: any = {
    autoApply: false,
    alwaysShowCalendars: false,
    showCancel: false,
    showClearButton: true,
    linkedCalendars: true,
    singleDatePicker: false,
    showWeekNumbers: false,
    showISOWeekNumbers: false,
    customRangeDirection: true,
    lockStartDate: false,
    closeOnAutoApply: true
  };
  Parent: Array<any> = []
  duplicateParent: Array<any> = []
  GROUP: Array<any> = ['Convirza Orlando', 'Convirza', 'Orlando']
  duplicateGROUP: Array<any> = ['Convirza Orlando', 'Convirza', 'Orlando']
  Reel: Array<any> = ['Admin', 'Manager', 'User', 'Identified-only']
  duplicateReel: Array<any> = ['Admin', 'Manager', 'User', 'Identified-only']
  emailFormArray: Array<any> = [];
  subgroupData: Array<any> = [];
  usersData: Array<any> = [];
  nameInput: any = '';
  externalInput: any = '';
  phoneInput: any = '';
  cityInput: any = '';
  zipInput: any = '';
  setpass : string = ''
  newpass : string = '';
  firstname: any = ''
  lastname: any = '';
  email: any = '';
  PhoneNumber: any = '';
  ExternalID: any = '';
  Agent: any = '';
  aGent: any = '';
  currentUserRole : string = ''
  reportingAccessBoxes = [
    { name: "6 Steps to Selling the Visit", id: 1156, isChecked : false, isShown : true, },
    { name: "Agent Performance", id: 2138, isChecked : false, isShown : true, },
    { name: "Analytics Summary", id: 1128, isChecked : false, isShown : true, },
    { name: "Billing Usage", id: 1134, isChecked : false, isShown : true, },
    { name: "Blocked Calls", id: 1138, isChecked : false, isShown : true, },
    { name: "Brand Muscle", id: 2134, isChecked : false, isShown : true, },
    { name: "Call Back", id: 1139, isChecked : false, isShown : true, },
    { name: "Caller Activity", id: 1131, isChecked : false, isShown : true, },
    { name: "Call Logs", id: 1111, isChecked : false, isShown : true, },
    { name: "Call Logs with Data Append", id: 1142, isChecked : false, isShown : true, },
    { name: "Call Overview", id: 1137, isChecked : false, isShown : true, },
    { name: "Calls by Region", id: 1130, isChecked : false, isShown : true, },
    { name: "Call Trends", id: 1127, isChecked : false, isShown : true, },
    { name: "Custom Billing", id: 2135, isChecked : false, isShown : true, },
    { name: "Doctor's Internet Call Logs", id: 1150, isChecked : false, isShown : true, },
    { name: "Email Digest", id: 1151, isChecked : false, isShown : true, },
    { name: "Group Activity Report", id: 2136, isChecked : false, isShown : true, },
    { name: "IVR Keypress", id: 1141, isChecked : false, isShown : true, },
    { name: "Listenforce", id: 2137, isChecked : false, isShown : true, },
    { name: "Marketing Dashboard", id: 1136, isChecked : false, isShown : true, },
    { name: "PIMM USA - Call Logs", id: 1152, isChecked : false, isShown : true, },
    { name: "Scored Calls", id: 1140, isChecked : false, isShown : true, },
    { name: "Spam Guard", id: 2139, isChecked : false, isShown : true, },
    { name: "Store Manager Scored Calls", id: 1153, isChecked : false, isShown : true, },
    { name: "Tags Summary", id: 1120, isChecked : false, isShown : true, },
    { name: "Tracking Number Settings", id: 1112, isChecked : false, isShown : true, },
    { name: "User Logs", id: 1114, isChecked : false, isShown : true, },
    { name: "Webhook Logs", id: 1129, isChecked : false, isShown : true, },
  ];
  @ViewChild('modalDataaat') modalDataaat: ElementRef;
  isAdmin: boolean=false;
  userData: any;
  Counter: number = 0;
  CounterUser: number = 0;
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (this.status === 1) {
      this.onNextpress();
      this.status = this.cardSelect;
      return
    }
    if (this.status === 2) {
      this.onLastpress();
      return
    }
    if (this.status === 4) {
      this.onlastgroup()
      return
    }
  }
  constructor( private auth: AuthenticationService,private router: Router,private modalService: NgbModal, private _database: ChecklistDatabase, private teams: profileService, private elm : ElementRef, private _groups : GroupsUsersService, private listOfRecording : RecordingLists) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    _database.dataChangePermission.subscribe(data => {
      this.dataSourceTree.data = data;
    });
    this.treeFlattenerB = new MatTreeFlattener(
      this.transformerB,
      this.getLevelB,
      this.isExpandableB,
      this.getChildrenB,
    );
    this.treeControlB = new FlatTreeControl<TodoItemFlatNode>(this.getLevelB, this.isExpandableB);
    this.dataSourceTreeB = new MatTreeFlatDataSource(this.treeControlB, this.treeFlattenerB);
    _database.dataChange.subscribe(data => {
      this.dataSourceTreeB.data = data;
      this.checklistSelectionB.select(this.treeControlB.dataNodes[0]);
      this.treeControlB.expand(this.treeControlB.dataNodes[0])
    });
  }

  firstLevelGroup : any
  firstLevelUser : any
  thirdLevelGroups : Array<any> = []
  duplicateThirdLevelGroups : Array<any> = []
  filterIndustryList : Array<any> = []
  filterStateList : Array<any> = []
  filterCanadaList : Array<any> = []
  userFirstName : Array<any>
  main_group = {id : 0, name : ''}
  isAdminAccess : boolean = false;
  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    // this.checkAll();
    this.GroupLoading = true;
    // this.teams.fetchTeams().subscribe(data => {
    //   console.log(data);

    //   // this.subuserloadPagination(this.copysubuserDetail);
    // });
    if(localStorage.getItem('adminInfo')){
      this.isAdmin = true;
  }else{
    this.isAdmin =false;
  }
    this.main_group = JSON.parse(localStorage.getItem('main_group')) || {id : 0, name : ''};
    this.selectGroupName = this.main_group.name;
    this.listFor = this.main_group.name;
    this.filterGroupID = this.main_group.id;
    this.getUsers(this.main_group.id, 'second');
      TREE_DATA = JSON.parse(localStorage.getItem('groups'));
      this.selectGroupName = this.main_group.name
      this.allNodesB.push(this.main_group.id)
      if(TREE_DATA){
        this.treeDataB = TREE_DATA;
        this._database.initialize();
      }
      this.filterIndustryList = [...this.duplicateMangagers.sort((a: any, b: any) => {
        return ('' + a.name).localeCompare(b.name);
      })]
      this.filterStateList= [...this.duplicateState.sort((a: any, b: any) => {
        return ('' + a.name).localeCompare(b.name);
      })]
      this.filterCanadaList= [...this.regionCanadaDuplicate.sort((a: any, b: any) => {
        return ('' + a.name).localeCompare(b.name);
      })]
  }
  TopSelectedGroup : any = {}
  originaleData : any

  subGroupsOUID : Array<any>
  subGroupsGrpName : Array<any>
  subGroupsExID : Array<any>
  subGroupsPhone : Array<any>
  subGroupsCity : Array<any>
  subGroupsZip : Array<any>
  userLastName : Array<any>
  userEmail : Array<any>
  userExID : Array<any>
  userAgentID : Array<any>


  sortingFirstName(){
    this.userFirstName =this.originaleData.data.users.map((item)=>{
      return item
    })
    this.userFirstName.sort((a: any, b: any) => {
      return ('' + a.first_name).localeCompare(b.first_name);
    });
  }
  sortingLastName(){
    this.userLastName =this.originaleData.data.users.map((item)=>{
      return item
    })
    this.userLastName.sort((a: any, b: any) => {
      return ('' + a.last_name).localeCompare(b.last_name);
    });
  }

  sortingUserEXID(){
    this.userExID = this.originaleData.data.users.map((item)=>{
      return item
    })
    this.userExID.sort((a, b) => {
        return ('' + a.user_ext_id).localeCompare(b.user_ext_id)
      });
  }
  sortingUserAgent(){
    this.userAgentID = this.originaleData.data.users.map((item)=>{
      return item
    })
    this.userAgentID.sort((a, b) => {
        return ( a.agent_id)-(b.agent_id)
      });
  }

  sortingUserEMail(){
    this.userEmail = this.originaleData.data.users.map((item)=>{
      return item
    })
    this.userEmail.sort((a, b) => {
        return ('' + a.email).localeCompare(b.email)
      });
  }
  sortingGroupName(){
    this.subGroupsGrpName = this.originaleData.data.subgroups.map((item)=>{
      return item
    })
    this.subGroupsGrpName.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name)
      });
  }

  sortingOUID(){
    this.subGroupsOUID = this.originaleData.data.subgroups.map((item)=>{
      return item
    })
    this.subGroupsOUID.sort((a, b) => {
      return (a.id)-(b.id)
    });
  }

  sortingEXID(){
    this.subGroupsExID = this.originaleData.data.subgroups.map((item)=>{
      return item
    })
    this.subGroupsExID.sort((a, b) => {
        return ('' + a.group_ext_id).localeCompare(b.group_ext_id)
      });
  }


  sortingPhone(){
    this.subGroupsPhone = this.originaleData.data.subgroups.map((item)=>{
      return item
    })
    this.subGroupsPhone.sort((a, b) => {
      return ('' + a.phone_number).localeCompare(b.phone_number)
    });
  }
  sortingCity(){
      this.subGroupsCity =this.originaleData.data.subgroups.map((item)=>{
        return item
      })
      this.subGroupsCity.sort((a: any, b: any) => {
        return ('' + a.city).localeCompare(b.city);
      })
  }
  sortingZIP(){
    this.subGroupsZip = this.originaleData.data.subgroups.map((item)=>{
      return item
    })
    this.subGroupsZip.sort((a: any, b: any) => {
        return ('' + a.zip).localeCompare(b.zip);
      })
  }
  populateData(data:any){
    console.log(data);
console.log('Populate')
    if(data.data.group.level === 3){
      this.hideGroupsTab = true
      this.subgroups = false;
      this.users = true
    }else{
      this.hideGroupsTab = false
      this.subgroups = true;
      this.users = false
    }
    this.originaleData = data;
     console.log(data);

    // this.subGroupsGrpName = data.data.subgroups.sort((a, b) => {
    //   return ('' + a.name).localeCompare(b.name)
    // });

    // this.subGroupsExID = data.data.subgroups.sort((a, b) => {
    //   return ('' + a.group_ext_id).localeCompare(b.group_ext_id)
    // });
    // this.subGroupsPhone = data.data.subgroups.sort((a, b) => {
    //   return ('' + a.phone_number).localeCompare(b.phone_number)
    // });
    // console.log(this.subGroupsPhone)
    // this.subGroupsCity =data.data.subgroups.sort((a: any, b: any) => {
    //   return ('' + a.city).localeCompare(b.city);
    // })
    // this.subGroupsZip = data.data.subgroups.sort((a: any, b: any) => {
    //   return ('' + a.zip).localeCompare(b.zip);
    // })
    // console.log(data.data.users)
    // this.userFirstName = data.data.users.sort((a: any, b: any) => {
    //   return ('' + a.first_name).localeCompare(b.first_name);
    // })
    // this.userLastName = data.data.users.sort((a: any, b: any) => {
    //   return ('' + a.last_name).localeCompare(b.last_name);
    // })
    // this.userEmail = data.data.users.sort((a: any, b: any) => {
    //   return ('' + a.email).localeCompare(b.email);
    // })
    // this.userExID = data.data.users
    // this.userAgentID = data.data.users
    this.subgroupData = data.data.subgroups;
    this.copyTeamDetail = data.data.subgroups;
    this.TopSelectedGroup = data.data.group;
    this.firstLevelGroup = data.data.subgroups ? data.data.subgroups[0] : {name: ''};
    this.Parent = [...data.data.groupParents];

    // this.Parent.unshift(data.data.group);
    this.thirdLevelGroups = [...data.data.userParents];
    // this.thirdLevelGroups.unshift(data.data.group);
    this.duplicateThirdLevelGroups = [...this.thirdLevelGroups]
    this.duplicateParent = [...this.Parent]
    this.usersData = data.data.users;
    this.copyuserDetail = data.data.users ? data.data.users : [];
    this.firstLevelUser = data.data.users ? data.data.users[0] : '';
    this.StatusInputText  = 'Active'
    // this.ScoringStatusInputText  = 'Active'

    this.isStatusChecked = true
    this.isScoringStatusChecked = false
    this.GroupLoading = false;

    this.itemLength = 25;
    this.lowerLimit = 0;
    this.uppreLimit = 25;
    this.currentPage = 1;
    this.GroupnameSort = 'acs'
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    this.onAscending();
    this.loadPagination(this.copyTeamDetail);
    this.useritemLength = 25;
    this.userlowerLimit = 0;
    this.useruppreLimit = 25;
    this.usercurrentPage = 1;
    this.fnSort  = 'none';
    this.lnSort  = 'none';
    this.uEmailSort  = 'none';
    this.UexternalSort  = 'none';
    this.UagentSort  = 'none';
    this.UroleSort  = 'none';
    this.UtnstatusSort  = 'none';
    this.StnstatusSort  = 'none';
    this.fnSort = 'acs'
    this.onfnsort();
    this.userloadPagination(this.copyuserDetail);
    this.clearRangeFilter();
    this.clearUserFilter();
    this.isSubGroupFilters = false;
    this.isUserFilters = false;
    this.StatusInputText = 'Active';
    this.isStatusChecked = true;
    this.isUserFilters = true;
    this.onBackpress();
    // this.onChangeeParent(data.data.group.name, data.data.group.id)
  }
  validateEmail(email)
  {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
  }
  CreateGroupsObj = {
    name: this.nameInput,
    External_Id: this.externalInput,
    State: this.currentState,
    City: this.cityInput,
    Phone: this.phoneInput,
    Zip: this.zipInput,
    Industry: this.currentmanager,
    Parentgroup: this.currentParent
  }
  nameerror: boolean = false;
  extinputerr: boolean = false;
  stateerror: boolean = false;
  cityerror: boolean = false;
  phoneinerror: boolean = false;
  ziperror: boolean = false;
  industryerror: boolean = false;
  parenterror: boolean = false;
  isuserRoleDropdown5: boolean = false;
  currentCreateState : string = '';
  isCreatingGroup : boolean = false;
  phonelength : boolean = false;
  CreateGroups() {
    // console.log(this.currentParent + ' ',this.nameInput + ' ',this.externalInput + ' ',this.phoneInput + ' ', this.cityInput + ' ', this.currentState + ' ', this.zipInput);


    this.nameerror = false;
    this.extinputerr = false;
    this.stateerror = false;
    this.cityerror = false;
    this.phoneinerror = false;
    this.ziperror = false;
    this.phonelength = false;
    this.ziperror = false;
    this.industryerror = false;
    this.parenterror = false;
    this.invalidExID = false;
    if (this.currentParent === '') {
      this.parenterror = true;
      return
    }
    if (this.nameInput === '') {
      this.nameerror = true;
      return
    }
    // if (this.externalInput === '') {
    //   this.nameerror = true;
    //   return
    // }
    if (!this.createGroupID) {
      this.industryerror = true;
      return
    }

    // if (this.phoneInput === '') {
    //   this.phoneinerror = true;
    //   return
    // }

    if(this.phoneInput){
      if (String(this.phoneInput).length < 10) {
        this.phonelength = true;
        return
      }
    }

    // if(this.currentCreateState == ''){
    //   this.stateerror = true;
    //   return
    // }}
    if(this.zipInput != ''){
      if(this.zipInput > 6 && this.zipInput < 4){
        this.ziperror = true;
        return
      }
    }
    // if (this.cityInput === '') {
    //   this.cityerror = true;
    //   return
    // }
    // if (this.currentState === '') {
    //   this.stateerror = true;
    //   return
    // }
    // if (this.zipInput === '') {
    //   this.ziperror = true;
    //   return
    // }
    this.isCreatingGroup = true;
    let obj = {
      "name": String(this.nameInput),
      "parent_group_id": String(this.currentGroupId),
      "industry_id": String(this.createGroupID),
      "industry_name": String(this.currentmanager),
      "zip": String(this.zipInput != 'undefined' ? this.zipInput : ''),
      "group_ext_id": String(this.externalInput),
      "phone_number" : String(this.phoneInput),
      "city": String(this.cityInput),
      "state": String(this.createStateID),
    }
    console.log(obj);

    this.teams.createTeam(obj).subscribe(res=>{
      this.isCreatingGroup = false;
      // console.log('hsjdhjsdhjh')

      if(res.status === 'success'){
        console.log('TREE_DATA',TREE_DATA)

          this.treeFlattenerB = new MatTreeFlattener(
            this.transformerB,
            this.getLevelB,
            this.isExpandableB,
            this.getChildrenB,
          );
          this.treeControlB = new FlatTreeControl<TodoItemFlatNode>(this.getLevelB, this.isExpandableB);
          this.dataSourceTreeB = new MatTreeFlatDataSource(this.treeControlB, this.treeFlattenerB);
          this._database.dataChange.subscribe(data => {
            this.dataSourceTreeB.data = data;
            this.checklistSelectionB.select(this.treeControlB.dataNodes[0]);
            this.treeControlB.expand(this.treeControlB.dataNodes[0])
          });
          console.log(res);
          this.originaleData.data.subgroups.push(res.data?.group)
          let groups : Array<any> = res.data?.groupsTree;

          groups = groups.sort((a, b) => {
            return ('' + a.text).localeCompare(b.text)
          });
      localStorage.setItem('groups', JSON.stringify(groups));
      // console.log('SetAgain Groups',JSON.parse(localStorage.getItem('groups')))
      TREE_DATA=JSON.parse(localStorage.getItem('groups'))
      // console.log(res.data.groupParents)
          this.Parent=res.data.groupParents;
          this.duplicateParent=res.data.groupParents

          this.selectGroupName = this.main_group.name
          if(TREE_DATA){
            this.treeDataB = TREE_DATA;
            this._database.initialize();
      }
      this.copyTeamDetail.push(res.data);
      this.applySorting();
      this.loadPagination(this.copyTeamDetail);
      this.onRefresh();
        if(res.data.group_parent_id == this.filterGroupID){

        }
        this.currentCreateState = '';
        this.nameInput = ''
        this.currentmanager = ''
        this.zipInput = ''
        this.externalInput = ''
        this.phoneInput = ''
        this.cityInput = ''
        this.createStateID = ''
        this.currentParent = ''
        this.currentGroupId  = undefined
        this.currentGroupId = undefined
        this.createGroupID = undefined
        this.status = 5;
    }else{
      if(res.message === 'External ID is already in use'){
        this.invalidExID = true;
      }else alert(res.message)
    }
    this.nameerror = false;
    this.extinputerr = false;
    this.stateerror = false;
    this.cityerror = false;
    this.phoneinerror = false;
    this.ziperror = false;
    this.phonelength = false;
    this.ziperror = false;
    this.industryerror = false;
    this.parenterror = false;

    // this.onBackpress();
  }, err=>{
    alert(err)
  })
  }

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


  applySorting(){
    if(this.ouidSort != 'none'){
      if(this.ouidSort == 'acs'){
        this.onOUID()
      }else{
        this.onOUIDD()
      }
    }else if(this.GroupnameSort != 'none'){
      if(this.GroupnameSort == 'acs'){
        this.onAscending();
      }else{
        this.onDscending();
      }
    }else if(this.externalSort != 'none'){
      if(this.externalSort == 'acs'){
        this.onexternaldcs()
      }else{
        this.onIndustryacs()
      }

    }else if(this.industrySort != 'none'){
      if(this.industrySort == 'acs'){
        this.onIndustryacs();
      }else{
        this.onIndustrydcs();
      }
    }else if(this.phoneSort != 'none'){
      if(this.phoneSort == 'acs'){
        this.onPhoneacs();
      }else{
        this.onPhonedcs();
      }
    }else if(this.citySort != 'none'){
      if(this.citySort == 'acs'){
        this.onCityacs()
      }else{
        this.onCitydcs()
      }
    }else if(this.stateSort != 'none'){
      if(this.stateSort == 'acs'){
        this.onStateacs();
      }else{
        this.onstatedcs();
      }
    }else if(this.zipSort != 'none'){
      if(this.zipSort == 'acs'){
        this.onCityacs()
      }else{
        this.onCitydcs()
      }
    }
    this.onNextPagee()
    this.onPrevPagee()
  }
  applyUserSorting(){
    if(this.fnSort != 'none'){
      if(this.fnSort === 'acs'){
        this.onfnsort();
      }else{
        this.onfnsortd();
      }

    }else if(this.lnSort != 'none'){
      if(this.lnSort === 'acs'){
        this.onlnsort();
      }else{
        this.onlnsortd();
      }

    }else if(this.uEmailSort != 'none'){
      if(this.UexternalSort === 'acs'){
        this.onmailsort();
      }else{
        this.onmailsortd();
      }

    }else if(this.UexternalSort != 'none'){
      if(this.UexternalSort === 'acs'){
        this.Uexternalsort();
      }else{
        this.Uexternalsortd();
      }

    }else if(this.UagentSort != 'none'){
      if(this.UagentSort === 'acs'){
        this.Uagentsort();
      }else{
        this.Uagentsortd();
      }

    }else if(this.UroleSort != 'none'){
      if(this.UroleSort === 'acs'){
        this.Urolesort();
      }else{
        this.Urolesortd();
      }

    }else if(this.UtnstatusSort != 'none'){
      if(this.UtnstatusSort === 'acs'){
        this.Ustatussort();
      }else{
        this.Ustatussortd();
      }
      this.useronNextPagee();
      this.useronPrevPagee();
    }

    else if(this.StnstatusSort != 'none'){
      if(this.StnstatusSort === 'acs'){
        this.Sstatussort();
      }else{
        this.Sstatussortd();
      }
      this.useronNextPagee();
      this.useronPrevPagee();
    }

    this.uEmailSort != 'none'
    this.UexternalSort != 'none'
    this.UagentSort != 'none'
    this.UroleSort != 'none'
    this.UtnstatusSort != 'none'
    this.StnstatusSort != 'none'
  }
  resetEditGroup(i){
    console.log(i);
    this.duplicateParent.forEach(item=>{
      if(item.id == i.group_parent_id){
        this.currentParent = item.name
      }
    });
    if(i.state){

      this.duplicateState.forEach(item=>{
        if(i.state === item.id){
          this.editGroupState = item.name;
          this.STATEID = item.id;
        }
      });
    }else{
      this.editGroupState = '';
      this.STATEID = '';
    }
    this.duplicateMangagers.forEach(item=>{
      if(i.industry_id == item.id){
        this.currentUserRole = item.name
      }
    })
    this.nameInput = i.name
    this.externalInput = i.group_ext_id
    // this.currentUserRole = i.industry_name;
    this.INDUSTRYID = i.industry_id;
    this.phoneInput = i.phone_number ? i.phone_number : '';
    this.cityInput= i.city
    this.editGroupZipCode = i.zip
    this.status = 7
    this.teams.currentTeam = i.id

  }
  isUpdatingGroup : boolean = false;
  editGroupEmailErr : boolean = false;
  invalidAgentID : boolean = false;
  invalidExID : boolean = false;
  editGroupZipCode : number
  saveEditGroup(){
    this.editGroupEmailErr = false;
    this.invalidExID = false;
    this.phonelength = false;
    if(this.nameInput== ''){
      this.editGroupEmailErr = true;
      return
    }
    if(this.phoneInput){
      if (String(this.phoneInput).length !== 10) {
        this.phonelength = true;
        return
      }
    }
// console.log(this.currentParent + this.currentGroupId + ' || ',
//   this.nameInput + ' || ',
//   this.externalInput + ' || ',
//   this.currentUserRole + ' || ',
//   this.cityInput + ' || ',
//   this.currentState + ' || ',
//   this.zipInput + ' || ',
//   this.INDUSTRYID, ' || ', this.currentUserRole, "|| " , this.STATEID);
this.isUpdatingGroup = true;
let obj =
{
  "name": this.nameInput,
  "parent_group_id": Number(this.currentGroupId),
  "industry_id": Number(this.INDUSTRYID),
  "industry_name": this.currentUserRole,
  "phone_number": this.phoneInput ? String(this.phoneInput) : '',
  "city": this.cityInput,
  "state": this.STATEID,
      "zip": String(this.editGroupZipCode ? this.editGroupZipCode  : ''),
      "group_ext_id": this.externalInput
    }
    console.log(obj);


    this.teams.updateGroup(obj, this.GID).subscribe(res=>{
      console.log(res);
      if(res.status === 'success'){
        // this.modalService.dismissAll();
      this.modalText = `Group's details are updated.`
      this.onOpenToast();
        this.originaleData.data.subgroups.map((item,index)=>{
          if(item.id == res.data.id){
            this.originaleData.data.subgroups[index]=res.data
          }
        })
        this.copyTeamDetail.forEach((item, index)=>{

          if(item.id == res.data.id){
            this.copyTeamDetail[index] = res.data;
            // this.GroupnameSort = 'acs'
            // this.onAscending();
            this.applySorting();
            this.loadPagination(this.copyTeamDetail)
          }
        })
        this.onGroupRow(res.data, "update");
        this.phonelength = false;
        this.onBackpress();
      }else{
        if(res.message === 'External ID is already in use'){
          this.invalidExID = true;
        }else {
          alert(res.message)
        }
      }
      // this.currentParent = this.copyCurrentGroup;
      // this.editGroupState = this.copyeditgroupstate ;
      // this.currentUserRole = this.copycurrentUserrole;
      this.editGroupEmailErr = false;
      this.isUpdatingGroup = false;

    },err =>{
      alert(err);
      this.isUpdatingGroup = false;
    })
  }
  CreateUsersObj = {
    FirstName: this.firstname,
    LastName: this.lastname,
    Email: this.email,
    Phonenumber: this.PhoneNumber,
    externalID: this.ExternalID,
    Agent1: this.Agent,
    Agent2: this.aGent,
    Role: this.currentReel,
    Group: this.currentGROUP,
  }
  firsterror: boolean = false;
  lasterror: boolean = false;
  emailerror: boolean = false;
  phoneerror: boolean = false;
  externalerror: boolean = false;
  agenterror: boolean = false;
  aGenterror: boolean = false;
  reelerror: boolean = false;
  GROUPerror: boolean = false;
  validemail: boolean = false;
  password1 : boolean = false;
  password2 : boolean = false;
  correctpass : boolean = false;
  isPasswordUpdating  : boolean = false
  modalText : string = ''
changePassword(){
  this.password1 = false;
  this.password2 = false;
  this.correctpass = false;
  this.correctpass = false;
  if(this.setpass.length < 8 || this.newpass.length < 8 ){
    this.password2 = true;
    return
  }
  if(this.setpass !== this.newpass){
    this.correctpass = true;
    return
  }
  this.password1 = false;
  this.password2 = false;
  this.correctpass = false;
  this.isPasswordUpdating = true;
  this._groups.resetPassword({id: this.UID, password:this.newpass}).subscribe((res:any)=>{
    console.log(res);
    if(res.status == 'success'){
      this.modalService.dismissAll();
      this.modalText = 'The password has been changed.'
      this.onOpenToast()
      this.isPasswordUpdating = false;
    }
    else{
      console.log(res.message);

    }
    this.newpass = '';
    this.setpass = '';
  }, err=>{
    console.log(err);

  })
}





isCreatingUser : boolean = false;
isUserRoleDrop : boolean = false;
alreadyExist : boolean = false;
  CreateUsers() {
    console.log(this.firstname, this.lastname,this.email, this.Agent, this.aGent, this.currentReel, this.currentGROUP);

    this.firsterror = false;
    this.lasterror = false;
    this.emailerror = false;
    this.phoneerror = false;
    this.externalerror = false;
    this.agenterror = false;
    this.aGenterror = false;
    this.reelerror = false;
    this.validemail = false;
    this.GROUPerror = false;
    this.alreadyExist = false;
    this.invalidAgentID = false;
    if (this.firstname === '') {
      this.firsterror = true;
      return
    }
    if (this.lastname === '') {
      this.lasterror = true;
      return
    }
    if (this.email === '') {
      this.emailerror = true;
      return
    }
    if(!this.validateEmail(this.email)){
      this.validemail = true;
    }
    // if (this.PhoneNumber === '') {
    //   this.phoneerror = true;
    //   return
    // }
    // if (this.Agent === '') {
    //   this.agenterror = true;
    //   return
    // }
    // if (this.aGent === '') {
    //   this.aGenterror = true;
    //   return
    // }

    if (this.currentGROUP === '' || !this.userCreateID) {
      this.GROUPerror = true;
      return
    }
    if (this.currentReel === '') {
      this.reelerror = true;
      return
    }
    this.isCreatingUser = true
    let obj = {
      "first_name": String(this.firstname),
      "last_name":String(this.lastname),
      "email": String(this.email),
      "role": this.currentReel === 'Admin' ? 1 : ''  || this.currentReel === 'Manager' ? 2 : '' || this.currentReel === 'User' ? 3 : '' || this.currentReel === 'Identified-only' ? 8 : '',
      "group_id": Number(this.userCreateID),
      "user_ext_id": String(this.ExternalID),
      "agent_id":String(this.Agent)
    }
    console.log(obj);

    this.teams.createUser(obj).subscribe(res=>{
      console.log(res);
      this.originaleData.data.users.push(res.data)
      this.isCreatingUser = false
      if(res.status === 'success'){
        this.copyuserDetail.push(res.data);
        console.log(this.copyuserDetail);

        // this.fnSort  = 'none';
        // this.lnSort  = 'none';
        // this.uEmailSort  = 'none';
        // this.UexternalSort  = 'none';
        // this.UagentSort  = 'none';
        // this.UroleSort  = 'none';
        // this.UtnstatusSort  = 'none';
        // this.StnstatusSort  = 'none';
        // this.fnSort = 'acs'
        // this.onfnsort();
        this.applyUserSorting()
        this.userloadPagination(this.copyuserDetail);
        console.log(this.copyuserDetail);
        this.onUserRefresh()
        this.firsterror = false;
        this.lasterror = false;
        this.emailerror = false;
        this.validemail = false;
        this.phoneerror = false;
        this.externalerror = false;
        this.agenterror = false;
        this.aGenterror = false;
        this.reelerror = false;
        this.GROUPerror = false;
        this.ExternalID = ''
        this.userCreateID = undefined
        this.currentReel  = ''
        this.email = ''
        this.lastname = ''
        this.firstname = ''
        this.Agent = ''
        this.currentGROUP = ''
        this.alreadyExist = false;
        // this.onBackpress();
        this.status = 3;
      }else{
        if(res.message === 'Email selected is already in use'){
          this.alreadyExist = true;
        }else if(res.message === 'Agent ID selected is already in use'){
          this.invalidAgentID = true;
        }else{
          alert(res.message)
        }
      }
    }, err=>{
      alert(err)
    })

  }
  onStatusChange(e){
    if(e.target.checked){
      this.editUserStatus = "Active"
    }else{
      this.editUserStatus = "Inactive"
    }
  }

  resetEditUser(i){
    console.log(i);
    this.UID = i.id;
    // this.GROUPID = this.TopSelectedGroup.id;
    // this.editGroupName = this.TopSelectedGroup.name;
    this.duplicateThirdLevelGroups.forEach(item=>{
      if(i.groupId == item.id){
        this.editGroupName = item.name;
        this.GROUPID = Number(item.id);
      }
    })
    this.editUserFName  = i.first_name
    this.editUserLName  = i.last_name
    this.editUserEmail  = i.email
    this.editUserExID  = i.user_ext_id
    this.editUserAgent  = i.agent_id
    this.editUserRoleId  = i.role_id
    this.editUserStatus = i.status
    this.currentReel = this.editUserRoleId === 1 ? 'Admin': '' || this.editUserRoleId === 2 ? 'Manager': '' || this.editUserRoleId === 3 ? 'User': ''
  }
  isUpdatingUser  : boolean = false
  editFNameErr : boolean = false;
  editLNameErr : boolean = false;
  editEmailErr : boolean = false;
  saveEditUser(){
    // let NewArray = this.usersData
    this.editFNameErr = false;
    this.editLNameErr = false;
    this.editEmailErr = false;
    this.invalidAgentID = false;
    if(this.editUserFName == ''){
    this.editFNameErr = true;
      return
  }
    if(this.editUserLName == ''){
    this.editLNameErr = true;
      return
  }
    if(!this.validateEmail(this.editUserEmail)){
    this.editEmailErr = true;
      return
  }
    this.isUpdatingUser = true;
    let obj = {
      "first_name": this.editUserFName,
      "last_name": this.editUserLName,
      "email": this.editUserEmail,
      "role": this.currentReel === 'Admin' ? 1 : this.currentReel === 'Manager' ? 2 : this.currentReel === 'Identified-only' ? 8 : 3,
      "group_id": Number(this.GROUPID),
      "user_ext_id":this.editUserExID ?  Number(this.editUserExID) : '',
      "agent_id": this.editUserAgent,
      "status" : this.editUserStatus
    }
    console.log(obj);

    this.teams.updateUser(obj, this.UID).subscribe(res=>{
      console.log(res);
      this.isUpdatingUser = false;
      if(res.status === 'success'){
        this.modalText = `User's details are updated.`
        this.onOpenToast();
        this.onBackpress();
        this.editFNameErr = false;
        this.editLNameErr = false;
        this.editEmailErr = false;


        this.originaleData.data.users.map((item,index)=>{
          if(item.id == res.data.id){
            this.originaleData.data.users[index]=res.data
          }
        })
        this.copyuserDetail.forEach((item, index)=>{
          // console.log('item',item)
          if(item.id == this.UID ){
            this.copyuserDetail[index] = res.data;
            // if(item.id !== res.data.id)
          }
        });

        this.usersData =[...this.copyuserDetail];

        this.onUserRefresh();


        // this.usersData=this.copyuserDetail.filter(item=>item.assign_scorecard !== res.data.assign_scorecard)

        // console.log('this.usersData',this.usersData)
        // this.usersData =[...this.copyuserDetail];
        // this.fnSort = 'acs'
        // this.onfnsort();
        this.applyUserSorting();
        this.userloadPagination(this.copyuserDetail);
      }else{
        if(res.message === 'Agent ID selected is already in use'){
          this.invalidAgentID = true;
        }else alert(res.message)
      }
    }, err=>{
      alert(err)
    })
    console.log('save user');
  }
  saveEditSubUser(){
    this.editFNameErr = false;
    this.editLNameErr = false;
    this.editEmailErr = false;
    if(this.editUserFName == ''){
    this.editFNameErr = true;
      return
  }
    if(this.editUserLName == ''){
    this.editLNameErr = true;
      return
  }
    if(!this.validateEmail(this.editUserEmail)){
    this.editEmailErr = true;
      return
  }
  // console.log(this.editUserFName + ' 123',
  //   this.editUserLName + ' 123',
  //   this.editUserEmail + ' 123',
  //   this.editUserExID + ' 123',
  //   this.editUserAgent + ' 123',
  //   this.editUserRoleId + ' 123',
  //   this.editUserStatus + ' 123',
  //   this.currentReel, 'asdfasdhk'+this.GROUPID);

    this.isUpdatingUser = true;
    let obj = {
      "first_name": this.editUserFName,
      "last_name": this.editUserLName,
      "email": this.editUserEmail,
      "role": this.currentReel === 'Admin' ? 1 : this.currentReel === 'Manager' ? 2 : this.currentReel === 'Identified-only' ? 8 : 3,
      "group_id": this.GROUPID,
      "user_ext_id": this.editUserExID,
      "agent_id": String(this.editUserAgent) ? String(this.editUserAgent) : '',
      "status" : this.editUserStatus
    }
    console.log(obj);

    this.teams.updateUser(obj, this.UID).subscribe(res=>{
      console.log(res);
      this.isUpdatingUser = false;
      if(res.status === 'success'){
        this.editFNameErr = false;
        this.editLNameErr = false;
        this.editEmailErr = false;
        this.editUserAgent = ''
        this.currentTeamsUsers.forEach((item, index)=>{
          if(item.id == this.UID){
            this.usersData[index] = res.data
          }
        })
      }
    })
    console.log('save user');
  }

  getPhoneNumber(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    this.phoneInput = event.target.value
    return true;

  }
  resetSubUserData : any = {}
  SubUID : number
  onSubUserRow(i){
    this.resetUserData = i;
    console.log(i);
    this.UID = i.id;
    this.TopHeadingNAme = i.first_name + " " + i.last_name;
    this.editUserFName  = i.first_name
  this.editUserLName  = i.last_name
  this.editUserEmail  = i.email
  this.editUserExID  = i.user_ext_id
  this.editUserAgent  = i.agent_id
  this.assign_scorecard = i.assign_scorecard;

  this.editUserRoleId  = i.role_id
  this.editUserStatus = i.status
  this.currentReel = this.editUserRoleId === 1 ? 'Admin': '' || this.editUserRoleId === 2 ? 'Manager': '' || this.editUserRoleId === 3 ? 'User': '' || this.editUserRoleId === 8 ? 'Identified-only': ''
   this.duplicateThirdLevelGroups.forEach(item=> {
     if(i.groupId == item.id){
       this.editGroupName = item.name;
       this.GROUPID = Number(item.id);
     }
   })
  this.status = 6;
  }
  subGroup() {
    this.subgroups = true;
    this.users = false;
  }
  Acceess() {
    this.Groupaccess = true;
    this.Audioscoring = false;
    this.Reportingaccess = false;
  }
  AudioScoring() {
    this.Groupaccess = false;
    this.Audioscoring = true;
    this.Reportingaccess = false;
  }
  ReportingAcc() {
    this.Groupaccess = false;
    this.Audioscoring = false;
    this.Reportingaccess = true;
  }
  sers() {
    this.subgroups = false;
    this.users = true;
  }

  onUser() {
    this.subgroups = false;
    this.users = true;
  }
  onButtonClick() {
    this.status = 1;
  }
  selectAll() {
    // let checkBoxes = document.querySelectorAll('.check-input');
    // checkBoxes.forEach((ele: any) => ele.click());
    // console.log('select all');
    const isAllChecked = (item) => item.isChecked === true;
    this.selectedAccessList = [];
    if(this.reportingAccessBoxes.every(isAllChecked)){
      this.selectedAccessList = [];
      this.reportingAccessBoxes.forEach(item=>{
        item.isChecked = false;
      });
    }else{
      this.reportingAccessBoxes.forEach(item=>{
        this.selectedAccessList.push(item.id);
        item.isChecked = true;
      });
    }

  }
  reportAccessText:string = ''
  onSearchReportAccess(e:string){
    this.reportAccessText = e;
    this.reportingAccessBoxes = this.reportingAccessBoxes.map(item=>{
      let name :string = item.name;
      if(name.toLowerCase().includes(e.toLowerCase())){
        item.isShown = true;
      }else{
        item.isShown = false;
      }
      return item;
    })
  }
  validatePassword(password){
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&=,./;:'"#^`~><|{}+)(_-])[A-Za-z\d@$!%*?&=,./;:`~'"#^><|{}+)(_-]{8,15}$/;
    return re.test(password);
  }
  onBackpress() {
    this.invalidAgentID = false;
    this.invalidExID = false;
    this.isSecondGrid = false
    this.editUserAgent = ''
    this.alreadyExist = false;
    this.editGroupName = ''
    this.GROUPID = ''
    this.editGroupState = '';
    this.phoneInput = '';
    this.isStateDropdown = false;
    this.isDateDropdown5 = false;
    this.isparentDropdown = false;
    this.editGroupEmailErr = false;
    this.editFNameErr = false;
    this.editLNameErr = false;
    this.editEmailErr = false;
    this.status = 0;
    this.firsterror = false;
    this.lasterror = false;
    this.emailerror = false;
    this.validemail = false;
    this.phoneerror = false;
    this.externalerror = false;
    this.agenterror = false;
    this.aGenterror = false;
    this.reelerror = false;
    this.GROUPerror = false;
    this.nameerror = false;
    this.extinputerr = false;
    this.stateerror = false;
    this.cityerror = false;
    this.phoneinerror = false;
    this.phonelength = false;
    this.ziperror = false;
    this.industryerror = false;
    this.parenterror = false;
    this.groupdropdown = false;
    this.firstname = '';
    this.lastname = '';
    this.email = '';
    this.PhoneNumber = '';
    this.ExternalID = '';
    this.Agent = '';
    this.aGent = '';
    this.currentReel = '';
    this.currentGROUP = '';
    this.nameInput = '';
    this.externalInput = '';
    this.currentState = '';
    this.cityInput = '';
    this.phoneInput = '';
    this.zipInput = '';
    this.currentmanager = '';
    this.currentParent = '';
    this.Parent = this.duplicateParent;
    this.State = this.duplicateState;
    this.regionCanada = [...this.regionCanadaDuplicate]
    this.managerNameList = this.duplicateMangagers;
    this.thirdLevelGroups = this.duplicateThirdLevelGroups;
    this.isCreatingUser = false;
    this.isCreatingGroup = false;
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
  onCreateGroupBack(){
    this.status = 1;
    this.nameInput = '';
    this.externalInput = '';
    this.currentState = '';
    this.cityInput = '';
    this.phoneInput = '';
    this.zipInput = '';
    this.currentmanager = '';
    this.currentParent = '';
    this.nameerror = false;
    this.extinputerr = false;
    this.stateerror = false;
    this.cityerror = false;
    this.phoneinerror = false;
    this.phonelength = false;
    this.ziperror = false;
    this.industryerror = false;
    this.parenterror = false;
    this.Parent = this.duplicateParent;
    this.State = this.duplicateState;
    this.regionCanada = [...this.regionCanadaDuplicate]
    this.managerNameList = this.duplicateMangagers;
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.GroupnameSort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.zipSort = 'none';
    this.stateSort = 'none';
    this.isCreatingUser = false;
    this.isCreatingGroup = false;
  }
  onNextpress() {
    this.currentParent = this.TopSelectedGroup.name;
    this.copyCurrentGroup = this.TopSelectedGroup.name;
    this.currentGroupId = this.TopSelectedGroup.id;
    this.userCreateID = this.TopSelectedGroup.id;
    this.currentGROUP = this.TopSelectedGroup.name;
    this.status = this.cardSelect;
  }
  onLastpress() {
    this.CreateUsers();
  }
  onCreateback() {
    this.status = 1;
    this.firsterror = false;
    this.lasterror = false;
    this.emailerror = false;
    this.validemail = false;
    this.phoneerror = false;
    this.externalerror = false;
    this.agenterror = false;
    this.aGenterror = false;
    this.reelerror = false;
    this.GROUPerror = false;
    this.firstname = '';
    this.lastname = '';
    this.email = '';
    this.PhoneNumber = '';
    this.ExternalID = '';
    this.Agent = '';
    this.aGent = '';
    this.currentReel = '';
    this.currentGROUP = '';
    this.Parent = this.duplicateParent ;
    this.isCreatingUser = false;
    this.isCreatingGroup = false;
  }
  onGropress() {
    this.status = 4;
  }
  onlastgroup() {
    this.CreateGroups();
  }
  onChangeLang(e) {
    this.groupdropdown = false;
    this.currentLanguage = e;
  }
  cardSelect = 4;
  selectCard(e) {
    if (e) {
      this.cardSelect = 4;
    } else {
      this.cardSelect = 2;
    }

    if (this.cardSelect === 4) {
      this.IconSubgroup = true;
    } else {
      this.IconSubgroup = false;
    }
    if (this.cardSelect === 2) {
      this.IconUser = true;
    } else {
      this.IconUser = false;
    }
  }
  onKeydown(event) {
    if (event.key === "Enter") {
      console.log(event);
    }
  }
  keyup(event: KeyboardEvent): void {
    console.log(`key: ${event.key}`, `control held: ${event.ctrlKey}`);
  }
  onSearchManagers(e: string) {
    let keyword = e.toLowerCase();
    this.managerNameList = this.duplicateMangagers.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
  }
  onSearchRoles(e: string) {
    this.currentUserRole = e;
    let keyword = e.toLowerCase();
    this.managerNameList = this.duplicateMangagers.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
  }
  onKeyUp(e) {
    console.log(e);

  }
  userRole(e, id) {
    console.log(e, id, "user role ");
    this.isDateDropdown5 = false;
    this.currentmanager = e;
  }
  createGroupID : number
  teamRole(e, id) {
    console.log(e, id, "create ");
    this.createGroupID = id;
    this.isDateDropdown5 = false;
    this.currentmanager = e;
  }
  onSearchState(e: string) {
    this.currentEditState = e;
    this.editGroupState = e;
    let keyword = e.toLowerCase();
    this.State = this.duplicateState.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
    this.regionCanada = this.regionCanadaDuplicate.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
  }
  editGroupState : string = '';
  STATEID : string = '';
  copyeditgroupstate : string = '';
  createState(e, id) {
    // console.log(e, this.currentState);
    this.isStateDropdown = false;
    this.editGroupState = e;
    this.STATEID = id;
    this.copyeditgroupstate = e;
    this.currentEditState = e;
  }
  createStateID : any = ''
  EditState(e, id) {
    // console.log(e);
    this.createStateID= id;
    this.isStateDropdown = false;
    this.currentState = e;
  }
  onSearchParent(e: string) {
    this.currentParent = e
    let keyword = e.toLowerCase();
    this.Parent = this.duplicateParent.filter(item => {
      let i = item.name.slice(0, keyword.length).toLowerCase();
      if (i === keyword) {
        return item;
      }
    })
  }
  currentGroupId : number
  copyCurrentGroup : string = '';
  onChangeeParent(e, id) {
    this.copyCurrentGroup = e;
    this.currentGroupId = id;
    this.isparentDropdown = false;
    this.currentParent = e;
    // console.log(this.currentGroupId, this.currentParent);

  }
  onSearchRole(e: string) {
    let keyword = e.toLowerCase();
    this.Reel = this.duplicateReel.filter(item => {
      let i = item.slice(0, keyword.length).toLowerCase();
      if (i === keyword) {
        return item;
      }
    })
  }
  onChangeereel(e) {
    this.isreel = false;
    this.currentReel = e;
  }
  onSearchGroup(e: string) {
    this.editGroupName = e;
    let keyword = e.toLowerCase();
    this.thirdLevelGroups = this.duplicateThirdLevelGroups.filter(item => {
      let i = item.name.toLowerCase();
      if (i.includes(keyword)) {
        return item;
      }
    })
  }
  GROUPID : any
  onThirdGroup(e, id) {
    this.groupdropdown = false;
    this.GROUPID = id;
    this.editGroupName = e;
  }
  triggerModal(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'Group-Modals'
      })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }
  trigggerModal(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'Success-Modals'
      })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }
  DelModal(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'del-Modals'
      })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  isTeamUserLoading : boolean = false;
  secondGroupsPagination : boolean = false;
  currentTeamsUsers : Array<any> = []
  secondSubGroupsList : Array<any> = []
  secondSubGroupsListDuplicate : Array<any> = []
  isSecondGrid : boolean = false;
  currentEditState : string = ''
  resetGroupData : any = {};
  GID : number
  onGroupRow(i, trigger : string){
    this.GID = i.id
    this.currentGroupId = i.group_parent_id
    console.log(i);
    this.duplicateState.forEach(item=>{
      if(i.state === item.id){
        this.editGroupState = item.name;
        this.STATEID = item.id;
      }
    });
    this.duplicateMangagers.forEach(item=>{
      if(i.industry_id == item.id){
          this.currentUserRole = item.name;
          this.INDUSTRYID = String(item.id);
      }
    })
    this.resetGroupData = i;
    // this.currentParent = i.group_parent_id
    console.log(this.duplicateParent)
    this.duplicateParent.forEach(item=>{
      if(item.id == i.group_parent_id){
        this.currentParent = item.name
      }
    })
    this.TopHeadingNAme = i.name;
    this.nameInput = i.name
    this.externalInput = i.group_ext_id
    this.currentmanager = i.industry_name
    this.phoneInput = i.phone_number ? i.phone_number : ''
    this.cityInput= i.city
    this.currentState = i.state;
    this.editGroupZipCode = i.zip
    this.status = 7
    // if(this.currentGroupNode){
    //   if(this.currentGroupNode.level === 1){
    //     this.isSecondGrid = true;
    //     this.hideSecondSubGroups = true
    //   }else{
    //     this.hideSecondSubGroups = false
    //     this.isSecondGrid = false;
    //   }
    // }else{
    //   this.isSecondGrid = false;
    // }
    if(trigger === 'fetch'){
      this.isTeamUserLoading = true
      this.teams.currentTeam = i.id;
      this.teams.secondLevelUsers(this.GID).subscribe((res:any)=>{
        if(res.status === 'success'){
          // this.currentTeamsUsers = res.data.users;

          this.copysubuserDetail = res.data.users;
          this.secondSubGroupsList = res.data.subgroups;
          this.secondSubGroupsListDuplicate = res.data.subgroups;
          this.isTeamUserLoading = false;
          this.subuseritemLength = 25;
          this.subuserlowerLimit = 0;
          this.subuseruppreLimit = 25;
          this.subusertotalArraySize = 1;
          this.subusertotalPageCounter = 1;
          this.subuseractiveNumber  = 25;
          this.subusercurrentPage = 1;
          this.su_fnSort = 'acs';
          this.su_lnSort = 'none';
          this.su_EmailSort = 'none';
          this.su_externalSort = 'none';
          this.su_agentSort = 'none';
          this.su_roleSort = 'none';
          this.su_tnstatusSort = 'none';
          this.SUfnsort()
          this.subuserloadPagination(this.copysubuserDetail);

          this.SeconditemLength = 25;
          this.SecondlowerLimit = 0;
          this.SeconduppreLimit = 25;
          this.SecondtotalArraySize = 1;
          this.SecondtotalPageCounter = 1;
          this.SecondcurrentPage = 1;
          this.SecondouidSort = 'none';
          this.SecondexternalSort = 'none';
          this.SecondindustrySort = 'none';
          this.SecondphoneSort = 'none';
          this.SecondcitySort = 'none';
          this.SecondstateSort = 'none';
          this.SecondzipSort = 'none';
          this.SecondGroupnameSort = 'acs'
          this.SecondonAscending()
          this.SecondloadPagination(this.secondSubGroupsList);
          if(res.data.group.level === 3){
            console.log(res.data.group);

            this.isSecondGrid = true;
            this.hideSecondSubGroups = true
          }else{
            this.hideSecondSubGroups = false
            this.isSecondGrid = false;
          }
        }
      });
    }
  }
  onSecondSubGroups(){
    this.isSecondGrid = false;
  }
  onSecondSubUser(){
    this.isSecondGrid = true;
  }
  editUserFName : any = ''
  editUserLName : any = ''
  editUserEmail : any = ''
  editUserExID : any = ''
  editUserAgent : any = ''
  editUserRoleId : number
  editUserStatus : string = ''
  resetUserData : any = {}
  UID : number
  editGroupName  :string = ''
  TopHeadingNAme : string = '';
  assign_scorecard : boolean
  onUserRow(i){
    this.resetUserData = i;
    console.log('IIIIIIII',i);
    this.UID = i.id;
    this.TopHeadingNAme = i.first_name + " " + i.last_name;
    this.editUserFName  = i.first_name
  this.editUserLName  = i.last_name
  this.editUserEmail  = i.email
  this.editUserExID  = i.user_ext_id
  this.editUserAgent  = i.agent_id
  this.editUserRoleId  = i.role_id
  this.editUserStatus = i.status
  this.assign_scorecard = i.assign_scorecard;
  this.GROUPID = Number(i.groupId);
  this.currentReel = this.editUserRoleId === 1 ? 'Admin': '' || this.editUserRoleId === 2 ? 'Manager': '' || this.editUserRoleId === 3 ? 'User': '' || this.editUserRoleId === 8 ? 'Identified-only': ''
   this.duplicateThirdLevelGroups.forEach(item=>{
     if(i.groupId == item.id){
       this.editGroupName = item.name;

     }
   })
  this.status = 6;
  let user: any = JSON.parse(localStorage.getItem('user'));
  console.log(user);

    if(user){
      if(user.data.user.email == this.editUserEmail){
        this.isAdminAccess = true;
      }else this.isAdminAccess = false
    }
}

  userCreateID : any
  onUserCreate(e, id){
    this.userCreateID = id;
    this.currentGROUP = e;
    this.groupdropdown = false
    console.log(e, id);

  }
    INDUSTRYID : string = ''
    copycurrentUserrole : string = ''

  editIndustry(e, id){
    this.currentUserRole = e;
    this.isuserRoleDropdown5 = false;
    this.INDUSTRYID = id;
    this.copycurrentUserrole = e;
  }
  getIndustryName(id:number){
    let name : string = ''
    this.duplicateMangagers.forEach(item=>{
      if(item.id == id){
        name = item.name
      }
    });
    return name;
  }









  // ============================================

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };


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
    this.checklistSelection.toggle(node);
    // const descendants = this.treeControl.getDescendants(node);
    // this.checklistSelection.isSelected(node)
    //   ? this.checklistSelection.select(...descendants)
    //   : this.checklistSelection.deselect(...descendants);
  }
  saveSelectedNodes(node: TodoItemFlatNode, e: any): void {
    let nodeName = node.item;
    //  let index = this.treeControl.dataNodes.findIndex(i => i.item === nodeName);
    //  this.checklistSelection.toggle(node);
    if (e) {
      this.allNodes.push(node.id);
    } else {
      this.allNodes = this.allNodes.filter(item => {
        if (node.id !== item) {
          return item;
        }
      })
    }
    // this.checklistSelection.isSelected(node)
    //   ? this.checklistSelection.select(...descendants)
    //   : this.checklistSelection.deselect(...descendants);
    // descendants.forEach(child => this.checklistSelection.isSelected(child));
    // this.checkAllParentsSelection(node);
  }

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode, e): void {
    if (e) {
      this.allNodes.push(node.id);
    } else {
      this.allNodes = this.allNodes.filter(item => {
        if (node.id !== item) {
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
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
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
      this.allNodes = this.allNodes.filter(item => {
        if (item !== node.id) {
          return item
        }
      })
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
      this.allNodes.push(node.id)
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
  allNodes: any[] = []
  checkAll() {
    this.treeControl.expand(this.treeControl.dataNodes[0])
    this.allNodes = [];
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if (this.treeControl.dataNodes[i].isSelected) {
        this.allNodes.push(this.treeControl.dataNodes[i].id);
        this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
      }
    }
  }

  getGroups() {
    this.newCurrentArr = [];
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if (this.checklistSelection.isSelected(this.treeControl.dataNodes[i])) {
          this.newCurrentArr.push(this.treeControl.dataNodes[i].id);
      }
    }
  }

  checkAll1() {
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      let isNode = this.allNodes.find(item => item === this.treeControl.dataNodes[i].id)
      if (isNode) {
        this.checklistSelection.select(this.treeControl.dataNodes[i]);
      }
      // this.treeControl.expand(this.treeControl.dataNodes[i])
    }
  }
  currentText: any = '';
  filterChanged(filterText: string) {
    this.currentText = filterText
    this.filter(filterText);
    if (filterText) {
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
        console.log(o);

        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        // node.isSelected = o.isSelected;
        // node.id = o.id;
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
        let str = (<string>ftd?.code);
        while (str?.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);
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
    const data = this._database.buildFileTreePermission(this.filteredTreeData, '0');
    // Notify the change.
    this._database.dataChangePermission.next(data);
    this.checkAll1();
  }

  getcheckedGroup(){
    console.log(this.allNodes);
    // console.log(this.treeControl.dataNodes);

  }








// ==================== Single Group Selection Tree
openScrollableContent(longContent) {
  this.modalService.open(longContent, { scrollable: true });
  for (let i = 0; i < this.treeControlB.dataNodes.length; i++) {
    let isNode = this.allNodesB.find(item => item === this.treeControlB.dataNodes[i].id)
    if (isNode) {
      this.parent = this.getParentNodeB(this.treeControlB.dataNodes[i]);
    }
    // this.treeControlB.expand(this.treeControlB.dataNodes[i])
  }
  if(this.parent){
    this.treeControlB.expand(this.parent);
  }
}
breadText : string = ''


private _transformerB = (node: FoodNode, level: number) => {
  return {
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
  };
};


getLevelB = (node: TreeItemFlatNode) => node.level;

isExpandableB = (node: TreeItemFlatNode) => node.expandable;

getChildrenB = (node: TreeItemNode): TreeItemNode[] => node.children;

id = (node: TreeItemNode): TreeItemNode[] => node.id;

hasChildB = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

/**
 * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
 */
transformerB = (node: TreeItemNode, level: number) => {
  const existingNode = this.nestedNodeMapB.get(node);
  const flatNode = existingNode && existingNode.item === node.item
    ? existingNode
    : new TreeItemFlatNode();
  flatNode.item = node.item;
  flatNode.level = level;
  flatNode.code = node.code;
  flatNode.id = node.id;
  flatNode.expandable = node.children && node.children.length > 0;
  this.flatNodeMapB.set(flatNode, node);
  this.nestedNodeMapB.set(node, flatNode);
  return flatNode;
}

/** Whether all the descendants of the node are selected */
descendantsAllSelectedB(node: TreeItemFlatNode): boolean {
  const descendants = this.treeControlB.getDescendants(node);
  return descendants.every(child => this.checklistSelectionB.isSelected(child));
}

/** Whether part of the descendants are selected */
descendantsPartiallySelectedB(node: TreeItemFlatNode): boolean {
  const descendants = this.treeControlB.getDescendants(node);
  const result = descendants.some(child => this.checklistSelectionB.isSelected(child));
  return result && !this.descendantsAllSelectedB(node);
}

/** Toggle the to-do item selection. Select/deselect all the descendants node */
todoItemSelectionToggleB(node: TreeItemFlatNode): void {
  this.checklistSelectionB.toggle(node);
  const descendants = this.treeControlB.getDescendants(node);
  this.checklistSelectionB.isSelected(node)
    ? this.checklistSelectionB.select(...descendants)
    : this.checklistSelectionB.deselect(...descendants);
}
saveSelectedNodesB(node: TodoItemFlatNode, e: any): void {
  let nodeName = node.item;
  //  let index = this.treeControlB.dataNodes.findIndex(i => i.item === nodeName);
  //  this.checklistSelectionB.toggle(node);
  const descendants = this.treeControlB.getDescendants(node);
  if (e) {
    descendants.filter(i => {
      this.allNodesB.push(i.item)
    }
    )
    this.allNodesB.push(node.item);
  } else {
    let removal: any = []
    descendants.filter(i => {
      removal.push(i.item)
    }
    )
    removal.push(node.item);
    removal.forEach(el => {
      this.allNodesB = this.allNodesB.filter(item => {
        if (el !== item) {
          return item
        }
      });
    })
  }
  this.checklistSelectionB.isSelected(node)
    ? this.checklistSelectionB.select(...descendants)
    : this.checklistSelectionB.deselect(...descendants);
  descendants.forEach(child => this.checklistSelectionB.isSelected(child));
  this.checkAllParentsSelection(node);
}

hasNoContentB = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

/** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
todoLeafItemSelectionToggleB(node: TodoItemFlatNode, e): void {

    this.allNodesB = [];
    this.allNodesB.push(node.id);
  this.unCheckAll();
  this.checklistSelectionB.select(node);
  // this.checkAllParentsSelection(node);
}

/* Checks all the parents when a leaf node is selected/unselected */
checkAllParentsSelectionB(node: TodoItemFlatNode): void {
  let parent: TodoItemFlatNode | null = this.getParentNode(node);
  while (parent) {
    this.checkRootNodeSelection(parent);
    parent = this.getParentNode(parent);
  }
}

/** Check root node checked state and change it accordingly */
checkRootNodeSelectionB(node: TodoItemFlatNode): void {
  const nodeSelected = this.checklistSelectionB.isSelected(node);
  const descendants = this.treeControlB.getDescendants(node);
  const descAllSelected =
    descendants.length > 0 &&
    descendants.every(child => {
      return this.checklistSelectionB.isSelected(child);
    });
  if (nodeSelected && !descAllSelected) {
    this.checklistSelectionB.deselect(node);
    this.allNodesB = this.allNodesB.filter(item => {
      if (item !== node.item) {
        return item
      }
    })
  } else if (!nodeSelected && descAllSelected) {
    this.checklistSelectionB.select(node);
    this.allNodesB.push(node.item)
  }
}

/* Get the parent node of a node */
getParentNodeB(node: TodoItemFlatNode): TodoItemFlatNode | null {
  const currentLevel = this.getLevel(node);

  if (currentLevel < 1) {
    return null;
  }

  const startIndex = this.treeControlB.dataNodes.indexOf(node) - 1;

  for (let i = startIndex; i >= 0; i--) {
    const currentNode = this.treeControlB.dataNodes[i];

    if (this.getLevel(currentNode) < currentLevel) {
      return currentNode;
    }
  }
  return null;
}

/** Select the category so we can insert the new item. */
addNewItemB(node: TodoItemFlatNode) {
  const parentNode = this.flatNodeMap.get(node);
  this._database.insertItem(parentNode!, '');
  this.treeControlB.expand(node);
}

/** Save the node to database */
saveNodeB(node: TodoItemFlatNode, itemValue: string) {
  const nestedNode = this.flatNodeMap.get(node);
  this._database.updateItem(nestedNode!, itemValue);
}
allNodesB: any[] = []
checkAllB() {

  this.treeControlB.expand(this.treeControlB.dataNodes[0])
  this.allNodesB = [];
  for (let i = 0; i < this.treeControlB.dataNodes.length; i++) {
    this.allNodesB.push(this.treeControlB.dataNodes[i].item);
    if (!this.checklistSelectionB.isSelected(this.treeControlB.dataNodes[i])) {
      this.checklistSelectionB.toggle(this.treeControlB.dataNodes[i]);
    }
    // this.treeControlB.expand(this.treeControlB.dataNodes[i])
  }
}
newCurrentArrB = []
unCheckAll() {
  this.newCurrentArrB = [];
  for (let i = 0; i < this.treeControlB.dataNodes.length; i++) {
    if (this.checklistSelectionB.isSelected(this.treeControlB.dataNodes[i])) {
      this.checklistSelectionB.toggle(this.treeControlB.dataNodes[i]);
    }
  }
}

groupLevel2 : string = ''
groupLevel3 : string = ''
filterGroupID : number
listFor : string = ''
isOneGroupSelected : boolean = false;
currentGroupNode : any
getGroupsB() {
  this.newCurrentArrB = [];
  // this.isOneGroupSelected = false

  for (let i = 0; i < this.treeControlB.dataNodes.length; i++) {
    if (this.checklistSelectionB.isSelected(this.treeControlB.dataNodes[i])) {

      let item = this.treeControlB.dataNodes[i];
      this.currentGroupNode = this.treeControlB.dataNodes[i];
      this.listFor = item.item;
       this.filterGroupID = this.treeControlB.dataNodes[i].id;
      // this.selectGroupName = item.item
      this.hideSubGroupButton = false;
      this.cardSelect = 4;
      this.status = 0;
      // if(item.level === 1){
      //   this.hideSecondSubGroups = true;
      //   this.isSecondGrid = true
      //   console.log(this.isSecondGrid , 'ef ');

      // }else{
      //   this.hideSecondSubGroups = false;
      //   this.isSecondGrid = false
      //   console.log(this.isSecondGrid , 'else ');
      // }
      if(item.level === 0){
        this.groupLevel2 = ''
        this.groupLevel3 = ''
        this.getUsers(item.id ,'second');
      }else if(item.level === 1){
        this.groupLevel2 = item.item
        this.groupLevel3 = ''
        this.getUsers(item.id ,'third');
      }else{
        this.groupLevel2 = this.getParentNodeB(this.treeControlB.dataNodes[i]).item;
        this.groupLevel3 = item.item
        this.hideSubGroupButton = true;
        this.cardSelect = 2;
        this.thirdLevelUsers(item.id);
      }
      this.modalService.dismissAll();
        return
    }
  }
}
getValuesB(){
  console.log(this.checklistSelectionB.selected);

}
parent: TodoItemFlatNode | null
checkAll1B() {
  this.unCheckAll();
  for (let i = 0; i < this.treeControlB.dataNodes.length; i++) {
    let isNode = this.allNodesB.find(item => item === this.treeControlB.dataNodes[i].id)
    if (isNode) {
      this.checklistSelectionB.select(this.treeControlB.dataNodes[i]);
      this.parent = this.getParentNodeB(this.treeControlB.dataNodes[i]);
    }
    // this.treeControlB.expand(this.treeControlB.dataNodes[i])
  }
}
currentTextB: any = '';
filterChangedB(filterText: string) {
  this.breadText = filterText
  this.filterB(filterText);
  if (filterText) {
    this.treeControlB.expandAll();
  } else {
    this.treeControlB.collapseAll();
    this.treeControlB.expand(this.treeControlB.dataNodes[0]);
    if(this.parent){
      this.treeControlB.expand(this.parent);
    }
    // this.treeControl.expandAll();
  }
}
buildFileTreeB(obj: any[], level: string): TreeItemNode[] {
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
        node.children = this.buildFileTreeB(children, o.code);
      }
      return node;
    });
}

treeDataB: any[] = []
filteredTreeDataB;

public filterB(filterText: string) {
  if (filterText) {
    this.filteredTreeDataB = this.treeDataB.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
    Object.assign([], this.filteredTreeDataB).forEach(ftd => {
      let str = (<string>ftd.code);
      while (str?.lastIndexOf('.') > -1) {
        const index = str?.lastIndexOf('.');
        str = str?.substring(0, index);
        if (this.filteredTreeDataB.findIndex(t => t.code === str) === -1) {
          const obj = this.treeDataB.find(d => d.code === str);
          if (obj) {
            this.filteredTreeDataB.push(obj);
          }
        }
      }
      if(ftd.code.split(".").length == 3){
        const matches = this.treeDataB.filter(element => {
          if (element.code.includes(<string>ftd.code + ".")) {
            return true;
          }
        });
        this.filteredTreeDataB = this.filteredTreeDataB.concat(matches);
      }
    });
  } else {
    this.filteredTreeDataB = this.treeDataB;
  }

  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  }
  this.filteredTreeDataB = this.filteredTreeDataB.filter(unique)
  // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
  // file node as children.
  const data = this.buildFileTreeB(this.filteredTreeDataB, '0');
  // Notify the change.
  this._database.dataChange.next(data);
  this.checkAll1B();
}
onDeleteGroupNode(e){

  let groups : Array<any> = e.groupsTree;
  groups = groups.sort((a, b) => {
    return ('' + a.text).localeCompare(b.text)
  });
localStorage.setItem('groups', JSON.stringify(groups));
// console.log('SetAgain Groups',JSON.parse(localStorage.getItem('groups')))
TREE_DATA=JSON.parse(localStorage.getItem('groups'))
// console.log(res.data.groupParents)
this.Parent=e.groupParents;
  this.treeDataB = TREE_DATA;
  this._database.initialize();
  this.checkAll1B();
}

getValues(){
  console.log(this.checklistSelection);

}
  onUserdelete() {
    this.status = 6;
  }


  // Sorting of Subgroups
  ouidSort : string = 'none';
  GroupnameSort : string = 'none';
  externalSort : string = 'none';
  industrySort : string = 'none';
  phoneSort : string = 'none';
  citySort : string = 'none';
  stateSort : string = 'none';
  zipSort : string = 'none';

  onOUID() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.id).localeCompare(b.id);
    });
  }

  onOUIDD() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.id).localeCompare(a.id);
    });
  }
  onAscending() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.name).localeCompare(b.name);

    });
  }

  onDscending() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.name).localeCompare(a.name);
    });
  }
  onexternalacs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.group_ext_id).localeCompare(b.group_ext_id);
    });
  }

  onexternaldcs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.group_ext_id).localeCompare(a.group_ext_id);
    });
  }
  onIndustryacs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.industry_name).localeCompare(b.industry_name);
    });
  }

  onIndustrydcs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.industry_name).localeCompare(a.industry_name);
    });
  }
  onPhoneacs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.phone_number).localeCompare(b.phone_number);
    });
  }

  onPhonedcs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.phone_number).localeCompare(a.phone_number);
    });
  }
  onCityacs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.city).localeCompare(b.city);
    });
  }

  onCitydcs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.city).localeCompare(a.city);
    });
  }
  onStateacs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + a.state).localeCompare(b.state);
    });
  }

  onstatedcs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return ('' + b.state).localeCompare(a.state);
    });
  }
  onzipacs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return Number(a.zip) - Number(b.zip)
    });
  }

  onzipdcs() {
    this.copyTeamDetail = this.copyTeamDetail.sort((a: any, b: any) => {
      return Number(b.zip) - Number(a.zip)
    });
  }
  updateGroupTable(){
    this.loadPagination(this.copyTeamDetail);
    this.elm.nativeElement.querySelector('#paginationInput')?.blur();
    let tar = this.elm.nativeElement.querySelector('#grouptarget');
    this.scrollToTop(tar);
  }
  onzipSort(){
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.GroupnameSort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    if(this.zipSort !== 'acs'){
      this.onzipacs();
      this.zipSort = 'acs';
    }else{
      this.onzipdcs();
      this.zipSort = 'dcs';
    }
    this.updateGroupTable();
  }
  onStateSort(){
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.GroupnameSort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.zipSort = 'none';
    if(this.stateSort !== 'acs'){
      this.onStateacs();
      this.stateSort = 'acs';
    }else{
      this.onstatedcs();
      this.stateSort = 'dcs';
    }
    this.updateGroupTable()
  }
  oncitySort(){
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.GroupnameSort = 'none';
    this.phoneSort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    if(this.citySort !== 'acs'){
      this.onCityacs();
      this.citySort = 'acs';
    }else{
      this.onCitydcs();
      this.citySort = 'dcs';
    }
    this.updateGroupTable()
  }
  onPhoneSort(){
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.GroupnameSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    if(this.phoneSort !== 'acs'){
      this.onPhoneacs();
      this.phoneSort = 'acs';
    }else{
      this.onPhonedcs();
      this.phoneSort = 'dcs';
    }
    this.updateGroupTable()
  }
  onOuidSort(){
    this.GroupnameSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    if(this.ouidSort !== 'acs'){
      this.onOUID();
      this.ouidSort = 'acs';
    }else{
      this.onOUIDD();
      this.ouidSort = 'dcs';
    }
    this.updateGroupTable()
  }


  ongroupSort(){
    this.ouidSort = 'none';
    this.externalSort = 'none';
    this.industrySort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    if(this.GroupnameSort !== 'acs'){
      this.onAscending();
      this.GroupnameSort = 'acs';
    }else{
      this.onDscending();
      this.GroupnameSort = 'dcs';
    }
    this.updateGroupTable()
  }
  onexternalSort(){
    console.log('external id ');

    this.ouidSort = 'none';
    this.GroupnameSort = 'none';
    this.industrySort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    if(this.externalSort !== 'acs'){
      this.onexternalacs();
      this.externalSort = 'acs';
    }else{
      this.onexternaldcs();
      this.externalSort = 'dcs';
    }
    this.updateGroupTable()
  }
  onIndustrySort(){
    this.ouidSort = 'none';
    this.GroupnameSort = 'none';
    this.externalSort = 'none';
    this.phoneSort = 'none';
    this.citySort = 'none';
    this.stateSort = 'none';
    this.zipSort = 'none';
    if(this.industrySort !== 'acs'){
      this.onIndustryacs();
      this.industrySort = 'acs';
    }else{
      this.onIndustrydcs();
      this.industrySort = 'dcs';
    }
    this.updateGroupTable()
  }


// ------------- Second sub groups sorting

// Sorting of Subgroups
SecondouidSort : string = 'none';
SecondGroupnameSort : string = 'none';
SecondexternalSort : string = 'none';
SecondindustrySort : string = 'none';
SecondphoneSort : string = 'none';
SecondcitySort : string = 'none';
SecondstateSort : string = 'none';
SecondzipSort : string = 'noneSecond';

SecondonOUID() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.id).localeCompare(b.id);
  });
}

SecondonOUIDD() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.id).localeCompare(a.id);
  });
}
SecondonAscending() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.name).localeCompare(b.name);

  });
}

SecondonDscending() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.name).localeCompare(a.name);
  });
}
Secondonexternalacs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.group_ext_id).localeCompare(b.group_ext_id);
  });
}

Secondonexternaldcs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.group_ext_id).localeCompare(a.group_ext_id);
  });
}
SecondonIndustryacs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.industry_name).localeCompare(b.industry_name);
  });
}

SecondonIndustrydcs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.industry_name).localeCompare(a.industry_name);
  });
}
SecondonPhoneacs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.phone_number).localeCompare(b.phone_number);
  });
}

SecondonPhonedcs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.phone_number).localeCompare(a.phone_number);
  });
}
SecondonCityacs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.city).localeCompare(b.city);
  });
}

SecondonCitydcs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.city).localeCompare(a.city);
  });
}
SecondonStateacs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + a.state).localeCompare(b.state);
  });
}

Secondonstatedcs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return ('' + b.state).localeCompare(a.state);
  });
}
Secondonzipacs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return Number(a.zip) - Number(b.zip)
  });
}

Secondonzipdcs() {
  this.secondSubGroupsList = this.secondSubGroupsList.sort((a: any, b: any) => {
    return Number(b.zip) - Number(a.zip)
  });
}
SecondupdateGroupTable(){
  this.loadPagination(this.secondSubGroupsList);
  this.elm.nativeElement.querySelector('#paginationInput').blur();
  let tar = this.elm.nativeElement.querySelector('#grouptarget');
  this.scrollToTop(tar);
}
SecondonzipSort(){
  this.SecondouidSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondGroupnameSort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondstateSort = 'none';
  if(this.SecondzipSort !== 'acs'){
    this.Secondonzipacs();
    this.SecondzipSort = 'acs';
  }else{
    this.Secondonzipdcs();
    this.SecondzipSort = 'dcs';
  }
  this.SecondupdateGroupTable();
}
SecondonStateSort(){
  this.SecondouidSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondGroupnameSort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondstateSort !== 'acs'){
    this.SecondonStateacs();
    this.SecondstateSort = 'acs';
  }else{
    this.Secondonstatedcs();
    this.SecondstateSort = 'dcs';
  }
  this.SecondupdateGroupTable()
}
SecondoncitySort(){
  this.SecondouidSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondGroupnameSort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondstateSort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondcitySort !== 'acs'){
    this.SecondonCityacs();
    this.SecondcitySort = 'acs';
  }else{
    this.SecondonCitydcs();
    this.SecondcitySort = 'dcs';
  }
  this.SecondupdateGroupTable()
}
SecondonPhoneSort(){
  this.SecondouidSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondGroupnameSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondstateSort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondphoneSort !== 'acs'){
    this.SecondonPhoneacs();
    this.SecondphoneSort = 'acs';
  }else{
    this.SecondonPhonedcs();
    this.SecondphoneSort = 'dcs';
  }
  this.SecondupdateGroupTable()
}
SecondonOuidSort(){
  this.SecondGroupnameSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondstateSort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondouidSort !== 'acs'){
    this.SecondonOUID();
    this.SecondouidSort = 'acs';
  }else{
    this.SecondonOUIDD();
    this.SecondouidSort = 'dcs';
  }
  this.SecondupdateGroupTable()
}
SecondongroupSort(){
  this.SecondouidSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondstateSort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondGroupnameSort !== 'acs'){
    this.SecondonAscending();
    this.SecondGroupnameSort = 'acs';
  }else{
    this.SecondonDscending();
    this.SecondGroupnameSort = 'dcs';
  }
  this.SecondupdateGroupTable()
}
SecondonexternalSort(){
  console.log('external id ');

  this.SecondouidSort = 'none';
  this.SecondGroupnameSort = 'none';
  this.SecondindustrySort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondstateSort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondexternalSort !== 'acs'){
    this.Secondonexternalacs();
    this.SecondexternalSort = 'acs';
  }else{
    this.Secondonexternaldcs();
    this.SecondexternalSort = 'dcs';
  }
  this.SecondupdateGroupTable()
}
SecondonIndustrySort(){
  this.SecondouidSort = 'none';
  this.SecondGroupnameSort = 'none';
  this.SecondexternalSort = 'none';
  this.SecondphoneSort = 'none';
  this.SecondcitySort = 'none';
  this.SecondstateSort = 'none';
  this.SecondzipSort = 'none';
  if(this.SecondindustrySort !== 'acs'){
    this.SecondonIndustryacs();
    this.SecondindustrySort = 'acs';
  }else{
    this.SecondonIndustrydcs();
    this.SecondindustrySort = 'dcs';
  }
  this.SecondupdateGroupTable()
}

  // Users Table Sorting

  updateUserTable(){
    this.userloadPagination(this.copyuserDetail);
    this.elm.nativeElement.querySelector('#userpaginationInput').blur();
    let tar = this.elm.nativeElement.querySelector('#grouptarget');
    this.scrollToTop(tar);
  }






// Sorting of Users

  fnSort : string = 'none';
  lnSort : string = 'none';
  uEmailSort : string = 'none';
  UexternalSort : string = 'none';
  UagentSort : string = 'none';
  UroleSort : string = 'none';
  UtnstatusSort : string = 'none';
  StnstatusSort : string = 'none';
  onFirstnameSort(){
    this.lnSort = 'none';
    this.uEmailSort = 'none';
    this.UexternalSort = 'none';
    this.UagentSort = 'none';
    this.UroleSort = 'none';
    this.UtnstatusSort = 'none';
    this.StnstatusSort = 'none';
    if(this.fnSort !== 'acs'){
      this.onfnsort();
      this.fnSort = 'acs';
    }else{
      this.onfnsortd();
      this.fnSort = 'dcs';
    }
    this.updateUserTable()
  }
  onfnsort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.first_name).localeCompare(b.first_name);
    });
  }

  onfnsortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.first_name).localeCompare(a.first_name);
    });
  }
  onlastnameSort(){
    this.fnSort = 'none';
    this.uEmailSort = 'none';
    this.UexternalSort = 'none';
    this.UagentSort = 'none';
    this.UroleSort = 'none';
    this.UtnstatusSort = 'none';
    this.StnstatusSort = 'none';
    if(this.lnSort !== 'acs'){
      this.onlnsort();
      this.lnSort = 'acs';
    }else{
      this.onlnsortd();
      this.lnSort = 'dcs';
    }
    this.updateUserTable()
  }
  onlnsort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.last_name).localeCompare(b.last_name);
    });
  }

  onlnsortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.last_name).localeCompare(a.last_name);
    });
  }
  onUemailSort(){
    this.fnSort = 'none';
    this.lnSort = 'none';
    this.UexternalSort = 'none';
    this.UagentSort = 'none';
    this.UroleSort = 'none';
    this.UtnstatusSort = 'none';
    this.StnstatusSort = 'none';
    if(this.uEmailSort !== 'acs'){
      this.onmailsort();
      this.uEmailSort = 'acs';
    }else{
      this.onmailsortd();
      this.uEmailSort = 'dcs';
    }
    this.updateUserTable()
  }
  onmailsort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.email).localeCompare(b.email);
    });
  }
  onmailsortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.email).localeCompare(a.email);
    });
  }
  onUexternalSort(){
    console.log('user externa sort');

    this.fnSort = 'none';
    this.lnSort = 'none';
    this.uEmailSort = 'none';
    this.UagentSort = 'none';
    this.UroleSort = 'none';
    this.UtnstatusSort = 'none';
    this.StnstatusSort = 'none';
    if(this.UexternalSort !== 'acs'){
      this.Uexternalsort();
      this.UexternalSort = 'acs';
    }else{
      this.Uexternalsortd();
      this.UexternalSort = 'dcs';
    }
    this.updateUserTable()
  }
  Uexternalsort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return Number(a.user_ext_id) -  Number(b.user_ext_id)
    });
  }
  Uexternalsortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return Number(b.user_ext_id) -  Number(a.user_ext_id)
    });
  }
  onUagentSort(){
    this.fnSort = 'none';
    this.lnSort = 'none';
    this.uEmailSort = 'none';
    this.UexternalSort = 'none';
    this.UroleSort = 'none';
    this.UtnstatusSort = 'none';
    this.StnstatusSort = 'none';
    if(this.UagentSort !== 'acs'){
      this.Uagentsort();
      this.UagentSort = 'acs';
    }else{
      this.Uagentsortd();
      this.UagentSort = 'dcs';
    }
    this.updateUserTable()
  }
  Uagentsort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.agent_id).localeCompare(b.agent_id);
    });
  }
  Uagentsortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.agent_id).localeCompare(a.agent_id);
    });
  }
  onUrolSort(){
    this.fnSort = 'none';
    this.lnSort = 'none';
    this.uEmailSort = 'none';
    this.UexternalSort = 'none';
    this.UagentSort = 'none';
    this.UtnstatusSort = 'none';
    this.StnstatusSort = 'none';
    if(this.UroleSort !== 'acs'){
      this.Urolesort();
      this.UroleSort = 'acs';
    }else{
      this.Urolesortd();
      this.UroleSort = 'dcs';
    }
    this.updateUserTable()
  }
  Urolesort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.role_id).localeCompare(b.role_id);
    });
  }
  Urolesortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.role_id).localeCompare(a.role_id);
    });
  }
  onSstatusSort(){
    this.fnSort = 'none';
    this.lnSort = 'none';
    this.uEmailSort = 'none';
    this.UexternalSort = 'none';
    this.UagentSort = 'none';
    this.UroleSort = 'none';
    this.UtnstatusSort = 'none';
    if(this.StnstatusSort !== 'acs'){
      this.Sstatussort();
      this.StnstatusSort = 'acs';
    }else{
      this.Sstatussortd();
      this.StnstatusSort = 'dcs';
    }
    this.updateUserTable()
  }
  Sstatussort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.status).localeCompare(b.status);
    });
  }
  Sstatussortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.status).localeCompare(a.status);
    });
  }
  onUstatusSort(){
    this.fnSort = 'none';
    this.lnSort = 'none';
    this.uEmailSort = 'none';
    this.UexternalSort = 'none';
    this.UagentSort = 'none';
    this.UroleSort = 'none';
    this.StnstatusSort = 'none';
    if(this.UtnstatusSort !== 'acs'){
      this.Ustatussort();
      this.UtnstatusSort = 'acs';
    }else{
      this.Ustatussortd();
      this.UtnstatusSort = 'dcs';
    }
    this.updateUserTable()
  }
  Ustatussort() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + a.assign_scorecard).localeCompare(b.assign_scorecard);
    });
  }
  Ustatussortd() {
    this.copyuserDetail = this.copyuserDetail.sort((a: any, b: any) => {
      return ('' + b.assign_scorecard).localeCompare(a.assign_scorecard);
    });
  }
  // Subgroup User List Table

  updateSUserTable(){
    this.subuserloadPagination(this.copysubuserDetail);
    this.elm.nativeElement.querySelector('#subuserpaginationInput').blur();
    // let tar = this.elm.nativeElement.querySelector('#grouptarget');
    // this.scrollToTop(tar);
  }


  // Users List Sort

  su_fnSort : string = 'none';
  su_lnSort : string = 'none';
  su_EmailSort : string = 'none';
  su_externalSort : string = 'none';
  su_agentSort : string = 'none';
  su_roleSort : string = 'none';
  su_tnstatusSort : string = 'none';

  SUfirstsort(){
    this.su_lnSort = 'none';
    this.su_EmailSort = 'none';
    this.su_externalSort = 'none';
    this.su_agentSort = 'none';
    this.su_roleSort = 'none';
    this.su_tnstatusSort = 'none';
    if(this.su_fnSort !== 'acs'){
      this.SUfnsort();
      this.su_fnSort = 'acs';
    }else{
      this.SUfnsortd();
      this.su_fnSort = 'dcs';
    }
    this.updateSUserTable()
  }

  SUfnsort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.first_name).localeCompare(b.first_name);
    });
  }
  SUfnsortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.first_name).localeCompare(a.first_name);
    });
  }

  SUlastsort(){
    this.su_fnSort = 'none';
    this.su_EmailSort = 'none';
    this.su_externalSort = 'none';
    this.su_agentSort = 'none';
    this.su_roleSort = 'none';
    this.su_tnstatusSort = 'none';
    if(this.su_lnSort !== 'acs'){
      this.SUlnsort();
      this.su_lnSort = 'acs';

    }else{
      this.SUlnsortd();
      this.su_lnSort = 'dcs';
    }
    this.updateSUserTable()
  }

  SUlnsort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.last_name).localeCompare(b.last_name);
    });
  }
  SUlnsortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.last_name).localeCompare(a.last_name);
    });
  }

  SUEmailsort(){
    this.su_fnSort = 'none';
    this.su_lnSort = 'none';
    this.su_externalSort = 'none';
    this.su_agentSort = 'none';
    this.su_roleSort = 'none';
    this.su_tnstatusSort = 'none';
    if(this.su_EmailSort !== 'acs'){
      this.SUemailsort();
      this.su_EmailSort = 'acs';
    }else{
      this.SUemailsortd();
      this.su_EmailSort = 'dcs';
    }
    this.updateSUserTable()
  }

  SUemailsort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.email).localeCompare(b.email);
    });
  }
  SUemailsortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.email).localeCompare(a.email);
    });
  }

  // sort
  SUExternalsort(){
    this.su_fnSort = 'none';
    this.su_lnSort = 'none';
    this.su_EmailSort = 'none';
    this.su_agentSort = 'none';
    this.su_roleSort = 'none';
    this.su_tnstatusSort = 'none';
    if(this.su_externalSort !== 'acs'){
      this.SUexternalsort();
      this.su_externalSort = 'acs';
    }else{
      this.SUexternalsortd();
      this.su_externalSort = 'dcs';
    }
    this.updateSUserTable()
  }

  SUexternalsort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.groupId).localeCompare(b.groupId);
    });
  }
  SUexternalsortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.groupId).localeCompare(a.groupId);
    });
  }


  SUAgentsort(){
    this.su_fnSort = 'none';
    this.su_lnSort = 'none';
    this.su_EmailSort = 'none';
    this.su_externalSort = 'none';
    this.su_roleSort = 'none';
    this.su_tnstatusSort = 'none';
    if(this.su_agentSort !== 'acs'){
      this.Suagentsort();
      this.su_agentSort = 'acs';
    }else{
      this.Suagentsortd();
      this.su_agentSort = 'dcs';
    }
    this.updateSUserTable()
  }

  Suagentsort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.agent_id).localeCompare(b.agent_id);
    });
  }
  Suagentsortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.agent_id).localeCompare(a.agent_id);
    });
  }

  SURolesort(){
    this.su_fnSort = 'none';
    this.su_lnSort = 'none';
    this.su_EmailSort = 'none';
    this.su_externalSort = 'none';
    this.su_agentSort = 'none';
    this.su_tnstatusSort = 'none';
    if(this.su_roleSort !== 'acs'){
      this.Surolesort();
      this.su_roleSort = 'acs';
    }else{
      this.Surolesortd();
      this.su_roleSort = 'dcs';
    }
    this.updateSUserTable()
  }

  Surolesort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.role_id).localeCompare(b.role_id);
    });
  }
  Surolesortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.role_id).localeCompare(a.role_id);
    });
  }
  SUTNsort(){
    this.su_fnSort = 'none';
    this.su_lnSort = 'none';
    this.su_EmailSort = 'none';
    this.su_externalSort = 'none';
    this.su_agentSort = 'none';
    this.su_roleSort = 'none';
    if(this.su_tnstatusSort !== 'acs'){
      this.SUstatussort();
      this.su_tnstatusSort = 'acs';
    }else{
      this.SUstatussortd();
      this.su_tnstatusSort = 'dcs';
    }
    this.updateSUserTable()
  }
  SUstatussort() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + a.status).localeCompare(b.status);
    });
  }
  SUstatussortd() {
    this.copysubuserDetail = this.copysubuserDetail.sort((a: any, b: any) => {
      return ('' + b.status).localeCompare(a.status);
    });
  }
// First Sub Groups Pagination

  teamdetail : Array<any> = []
  itemLength: number = 25;
  lowerLimit = 0;
  uppreLimit = 25;
  totalArraySize = 18;
  totalPageCounter = 1;
  activeNumber : number = 25;
  currentPage = 1;
  newElementArray: any;
  issPaginationDropdown: boolean = false;
  copyTeamDetail : any
  loadPagination(e) {
    this.newElementArray = e;
    this.subgroupData = (
      this.copyTeamDetail.slice(this.lowerLimit, this.uppreLimit)
    );
    this.totalArraySize = this.copyTeamDetail.length;

    this.totalPageCounter = Math.ceil(Math.abs(this.copyTeamDetail.length / this.itemLength));
  }
  onNextPagee() {
    let tar = document.getElementById('Subgrop');
    this.scrollToTop(tar);
    let upperLim: any;
    upperLim = this.uppreLimit;
    this.lowerLimit += this.itemLength;
    this.uppreLimit += this.itemLength;
    this.currentPage++;

    if (
      this.uppreLimit > this.copyTeamDetail.length &&
      upperLim >= this.copyTeamDetail.length
    ) {
      this.lowerLimit -= this.itemLength;
      this.uppreLimit -= this.itemLength;
      this.currentPage--;
      return;
    }
    this.loadPagination(this.copyTeamDetail);
  }
  onPrevPagee() {
    let tar = document.getElementById('Subgrop');
    if(tar){
      this.scrollToTop(tar);
    }
    this.lowerLimit -= this.itemLength;
    this.uppreLimit -= this.itemLength;
    this.currentPage--;
    if (this.lowerLimit < 0) {
      this.currentPage++;
      this.lowerLimit += this.itemLength;
      this.uppreLimit += this.itemLength;
      return;
    }
    this.loadPagination(this.copyTeamDetail);
  }
  changeItemLength(e) {
    this.issPaginationDropdown = false;
    this.totalPageCounter = 1;
    this.currentPage = 1;
    this.lowerLimit = 0;
    this.uppreLimit = Number(e);
    this.itemLength = Number(e);
    this.loadPagination(this.copyTeamDetail);
  }

  goTo(e) {
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let tar = document.getElementById('Subgrop');
    this.scrollToTop(tar);

    // this.scrollToTop(target)
    if (e <= this.totalPageCounter) {
      if(e < 1){
        return
      }
      if (e == 1) {
        this.changeItemLength(this.itemLength);
        return;
      }
      let upper = this.itemLength * Number(e);
      let lower = upper - this.itemLength;
      this.subgroupData = this.copyTeamDetail.slice(lower, upper);
        this.currentPage = e;
        this.lowerLimit = lower;
        this.uppreLimit = upper;
    }
  }
  // Scroll to top with pagination clicks
  scrollToTop(el) {
    var to = 0;
    var duration = 600;
    var start = el?.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    var easeInOutQuad = function(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    var animateScroll = function() {
      currentTime += increment;
      var val = easeInOutQuad(currentTime, start, change, duration);

     el ?  el.scrollTop = val : '';
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }


  // Secong Sub groups Pagination

  Secondteamdetail : Array<any> = []
  SeconditemLength: number = 25;
  SecondlowerLimit = 0;
  SeconduppreLimit = 25;
  SecondtotalArraySize = 18;
  SecondtotalPageCounter = 1;
  SecondcurrentPage = 1;
  SecondnewElementArray: any;
  SecondcopyTeamDetail : any
  SecondloadPagination(e) {
    this.newElementArray = e;
    this.secondSubGroupsList = (
      this.secondSubGroupsListDuplicate.slice(this.SecondlowerLimit, this.SeconduppreLimit)
    );
    this.SecondtotalArraySize = this.secondSubGroupsListDuplicate.length;

    this.SecondtotalPageCounter = Math.ceil(Math.abs(this.secondSubGroupsListDuplicate.length / this.SeconditemLength));
  }
  SecondonNextPagee() {
    let tar = document.getElementById('Subgrop');
    this.SecondscrollToTop(tar);
    let upperLim: any;
    upperLim = this.SeconduppreLimit;
    this.SecondlowerLimit += this.SeconditemLength;
    this.SeconduppreLimit += this.SeconditemLength;
    this.SecondcurrentPage++;

    if (
      this.SeconduppreLimit > this.secondSubGroupsListDuplicate.length &&
      upperLim >= this.secondSubGroupsListDuplicate.length
    ) {
      this.SecondlowerLimit -= this.SeconditemLength;
      this.SeconduppreLimit -= this.SeconditemLength;
      this.SecondcurrentPage--;
      return;
    }
    this.loadPagination(this.secondSubGroupsListDuplicate);
  }
  SecondonPrevPagee() {
    let tar = document.getElementById('Subgrop');
    if(tar){
      this.SecondscrollToTop(tar);
    }
    this.SecondlowerLimit -= this.SeconditemLength;
    this.SeconduppreLimit -= this.SeconditemLength;
    this.SecondcurrentPage--;
    if (this.SecondlowerLimit < 0) {
      this.SecondcurrentPage++;
      this.SecondlowerLimit += this.SeconditemLength;
      this.SeconduppreLimit += this.SeconditemLength;
      return;
    }
    this.SecondloadPagination(this.secondSubGroupsListDuplicate);
  }
  SecondchangeItemLength(e) {
    this.secondGroupsPagination = false;
    // this.SecondtotalPageCounter = 1;
    // this.SecondcurrentPage = 1;
    // this.SecondlowerLimit = 0;
    // this.SeconduppreLimit = Number(e);
    this.SeconditemLength = Number(e);
    // this.SecondloadPagination(this.secondSubGroupsListDuplicate);
  }

  SecondgoTo(e) {
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let tar = document.getElementById('Subgrop');
    this.SecondscrollToTop(tar);

    // this.scrollToTop(target)
    if (e <= this.SecondtotalPageCounter) {
      if(e < 1){
        return
      }
      if (e == 1) {
        this.SecondchangeItemLength(this.SeconditemLength);
        return;
      }
      let upper = this.SeconditemLength * Number(e);
      let lower = upper - this.SeconditemLength;
      this.secondSubGroupsList = this.secondSubGroupsListDuplicate.slice(lower, upper);
        this.SecondcurrentPage = e;
        this.SecondlowerLimit = lower;
        this.SeconduppreLimit = upper;
    }
  }
  // Scroll to top with pagination clicks
  SecondscrollToTop(el) {
    var to = 0;
    var duration = 600;
    var start = el?.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    var easeInOutQuad = function(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    var animateScroll = function() {
      currentTime += increment;
      var val = easeInOutQuad(currentTime, start, change, duration);

     el ?  el.scrollTop = val : '';
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }








  useritemLength: number = 25;
  userlowerLimit = 0;
  useruppreLimit = 25;
  usertotalArraySize = 18;
  usertotalPageCounter = 1;
  useractiveNumber : number = 25;
  usercurrentPage = 1;
  usernewElementArray: any;
  issPaginationDropdown11: boolean = false;
  copyuserDetail : any = []
  userloadPagination(e) {
    this.newElementArray = e;
    this.usersData = (
      this.copyuserDetail?.slice(this.userlowerLimit, this.useruppreLimit)
    );
    this.usertotalArraySize = this.copyuserDetail?.length;
    this.usertotalPageCounter = Math.ceil(Math.abs(this.copyuserDetail?.length / this.useritemLength));
  }
  useronNextPagee() {
    let dar = document.getElementById('usr');
    this.scrollToTop(dar);
    let userupperLim: any;
    userupperLim = this.useruppreLimit;
    this.userlowerLimit += this.useritemLength;
    this.useruppreLimit += this.useritemLength;
    this.usercurrentPage++;

    if (
      this.useruppreLimit > this.copyuserDetail.length &&
      userupperLim >= this.copyuserDetail.length
    ) {
      this.userlowerLimit -= this.useritemLength;
      this.useruppreLimit -= this.useritemLength;
      this.usercurrentPage--;
      return;
    }
    this.userloadPagination(this.copyuserDetail);
  }
  useronPrevPagee() {
    let dar = document.getElementById('usr');
    if(dar){
      this.scrollToTop(dar);
    }
    this.userlowerLimit -= this.useritemLength;
    this.useruppreLimit -= this.useritemLength;
    this.usercurrentPage--;
    if (this.userlowerLimit < 0) {
      this.usercurrentPage++;
      this.userlowerLimit += this.useritemLength;
      this.useruppreLimit += this.useritemLength;
      return;
    }
    this.userloadPagination(this.copyuserDetail);
  }
  userchangeItemLength(e) {
    this.issPaginationDropdown11 = false;
    this.usertotalPageCounter = 1;
    this.usercurrentPage = 1;
    this.userlowerLimit = 0;
    this.useruppreLimit = Number(e);
    this.useritemLength = Number(e);
    this.userloadPagination(this.copyuserDetail);
  }

  usergoTo(e) {
    this.elm.nativeElement.querySelector('#userpaginationInput').blur();
    let dar = document.getElementById('usr');
    this.scrollToTop(dar);

    // this.scrollToTop(target)
    if (e <= this.usertotalPageCounter) {
      if(e < 1){
        return
      }
      if (e == 1) {
        this.userchangeItemLength(this.useritemLength);
        return;
      }
      let userupper = this.useritemLength * Number(e);
      let userlower = userupper - this.useritemLength;
      this.usersData = this.copyuserDetail.slice(userlower, userupper);
        this.usercurrentPage = e;
        this.userlowerLimit = userlower;
        this.useruppreLimit = userupper;
    }
  }
  // Scroll to top with pagination clicks


  subuseritemLength: number = 25;
  subuserlowerLimit = 0;
  subuseruppreLimit = 25;
  subusertotalArraySize = 1;
  subusertotalPageCounter = 1;
  subuseractiveNumber : number = 25;
  subusercurrentPage = 1;
  subusernewElementArray: any;
  subissPaginationDropdown: boolean = false;
  copysubuserDetail : any = []
  subuserloadPagination(e) {
    this.subusernewElementArray = e;
    this.currentTeamsUsers = (
      this.copysubuserDetail?.slice(this.subuserlowerLimit, this.subuseruppreLimit)
    );
    this.subusertotalArraySize = this.copysubuserDetail.length;
    if(this.subusertotalArraySize > 25){
    this.subusertotalPageCounter = Math.ceil(Math.abs(this.copysubuserDetail?.length / this.subuseritemLength));
    }
  }
  subuseronNextPagee() {
    let dar = document.getElementById('tmu');
    this.scrollToTop(dar);
    let subuserupperLim: any;
    subuserupperLim = this.subuseruppreLimit;
    this.subuserlowerLimit += this.subuseritemLength;
    this.subuseruppreLimit += this.subuseritemLength;
    this.subusercurrentPage++;

    if (
      this.subuseruppreLimit > this.copysubuserDetail.length &&
      subuserupperLim >= this.copysubuserDetail.length
    ) {
      this.subuserlowerLimit -= this.subuseritemLength;
      this.subuseruppreLimit -= this.subuseritemLength;
      this.subusercurrentPage--;
      return;
    }
    this.subuserloadPagination(this.copysubuserDetail);
  }
  subuseronPrevPagee() {
    let dar = document.getElementById('tmu');
    this.scrollToTop(dar);
    this.subuserlowerLimit -= this.subuseritemLength;
    this.subuseruppreLimit -= this.subuseritemLength;
    this.subusercurrentPage--;
    if (this.subuserlowerLimit < 0) {
      this.subusercurrentPage++;
      this.subuserlowerLimit += this.subuseritemLength;
      this.subuseruppreLimit += this.subuseritemLength;
      return;
    }
    this.subuserloadPagination(this.copysubuserDetail);
  }
  subuserchangeItemLength(e) {
    this.subissPaginationDropdown = false;
    this.subusertotalPageCounter = 1;
    this.subusercurrentPage = 1;
    this.subuserlowerLimit = 0;
    this.subuseruppreLimit = Number(e);
    this.subuseritemLength = Number(e);
    this.subuserloadPagination(this.copysubuserDetail);
  }

  subusergoTo(e) {
    this.elm.nativeElement.querySelector('#subuserpaginationInput').blur();
    let dar = document.getElementById('tmu');
    this.scrollToTop(dar);

    // this.scrollToTop(target)
    if (e <= this.subusertotalPageCounter) {
      if(e < 1){
        return
      }
      if (e == 1) {
        this.subuserchangeItemLength(this.subuseritemLength);
        return;
      }
      let subuserupper = this.subuseritemLength * Number(e);
      let subuserlower = subuserupper - this.subuseritemLength;
      this.currentTeamsUsers = this.copysubuserDetail.slice(subuserlower, subuserupper);
        this.subusercurrentPage = e;
        this.subuserlowerLimit = subuserlower;
        this.subuseruppreLimit = subuserupper;
    }
  }


  // Download Report Section ===============

  // Sub Group Reports
  subGroupReport(){
    let Data : Array<object> = []
    let obj: any = {}
    this.copyTeamDetail.forEach(item=>{
      obj = {};
      obj['OUID']=item.id ? item.id : '';
      obj['GROUP NAME']=item.name ? item.name : '';
      obj['EXTERNAL ID']=item.group_ext_id ? item.group_ext_id : '';
      obj['INDUSTRY']=this.getIndustryName(item.industry_id);
      obj['PHONE']=item.phone_number ? item.phone_number : '';
      obj['CITY']=item.city ? item.city : '';
      obj['STATE']=item.state ? item.state : '';
      obj['ZIP CODE']=item.zip ? item.zip : '';
      obj['Parent Group']=item.group_parent_name ? item.group_parent_name : '';
      obj['Parent Group OUID']=item.group_parent_id ? item.group_parent_id : '';
      obj['Parent Group External ID']=item.group_parent_ext_id ? item.group_parent_ext_id : '';
      Data.push(obj);
    });
    this.exportToCsv('Sub Groups', Data)
  }
  // Second Sub Group Reports
  secondSubGroupReport(){
    let Data : Array<object> = []
    let obj: any = {}
    this.secondSubGroupsList.forEach(item=>{
      obj = {};
      obj['OUID']=item.id ? item.id : '';
      obj['GROUP NAME']=item.name ? item.name : '';
      obj['EXTERNAL ID']=item.group_ext_id ? item.group_ext_id : '';
      obj['INDUSTRY']=this.getIndustryName(item.industry_id);
      obj['PHONE']=item.phone_number ? item.phone_number : '';
      obj['CITY']=item.city ? item.city : '';
      obj['STATE']=item.state ? item.state : '';
      obj['ZIP CODE']=item.zip ? item.zip : '';
      obj['Parent Group']=item.group_parent_name ? item.group_parent_name : '';
      obj['Parent Group OUID']=item.group_parent_id ? item.group_parent_id : '';
      obj['Parent Group External ID']=item.group_parent_ext_id ? item.group_parent_ext_id : '';
      Data.push(obj);
    });
    this.exportToCsv('Sub Groups', Data)
  }

  // User Reports
  userReport(){
    let Data : Array<object> = []
    let obj: any = {}
    this.copyuserDetail.forEach(item=>{
      obj = {};
      obj['FIRST NAME']=item.first_name ? item.first_name : '';
      obj['LAST NAME']=item.last_name ? item.last_name : '';
      obj['E-MAIL']=item.email ? item.email : '';
      obj['EXTERNAL ID']=item.user_ext_id ? item.user_ext_id : '';
      obj['AGENT ID']=item.agent_id ? item.agent_id : '';
      obj['ROLE']= item.role_id == 1 ? 'Admin': item.role_id == 2 ? 'Standard' :item.role_id == 8 ? 'Identified-only' : 'Read-only';
      obj['STATUS']=item.status ? item.status : '';
      obj['Group']=item.group_name ? item.group_name : '';
      obj['Group OUID']=item.groupId ? item.groupId : '';
      obj['Group External ID']=item.group_ext_id ? item.group_ext_id : '';
      obj['Access Audio']=item.user_access_audio ? 'Yes' : 'No';
      obj['Score Calls']=item.user_access_score_calls ? 'Yes' : 'No';
      Data.push(obj);
    });
    this.exportToCsv('Users', Data)

  }

  // Sub Users Reports
subUserReport(){
  let Data : Array<object> = []
    let obj: any = {}
    this.copysubuserDetail.forEach(item=>{
      obj = {};
      obj['FIRST NAME']=item.first_name ? item.first_name : '';
      obj['LAST NAME']=item.last_name ? item.last_name : '';
      obj['E-MAIL']=item.email ? item.email : '';
      obj['EXTERNAL ID']=item.user_ext_id ? item.user_ext_id : '';
      obj['AGENT ID']=item.agent_id ? item.agent_id : '';
      obj['ROLE']=     obj['ROLE']=item.role_id == 1 ? 'Admin': item.role_id == 2 ? 'Standard' :item.role_id == 8 ? 'Identified-only' : 'Read-only';
      obj['STATUS']=item.status ? item.status : '';
      obj['Group']=item.group_name ? item.group_name : '';
      obj['Group OUID']=item.groupId ? item.groupId : '';
      obj['Group External ID']=item.group_ext_id ? item.group_ext_id : '';
      obj['Access Audio']=item.user_access_audio ? 'Yes' : 'No';
      obj['Score Calls']=item.user_access_score_calls ? 'Yes' : 'No';
      Data.push(obj);
    });
    this.exportToCsv('Sub Users', Data)

}
  // Download CSV

  exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  isMainAccDropdown : boolean = false;
  isThirdAccDropdown : boolean = false;
  isMainAccF : boolean = false;
  hideGroupsTab : boolean = false
  closeAccountDropdown(){
    if (!this.isMainAccF) {
      this.isMainAccDropdown = false;
    }
  }
  checktiggerDate(e) {
    setTimeout(() => {
      this.isMainAccF = e;
    }, 100);
  }
  currentSubGroups : Array<any>  = []
  thirdLevelSubGroups : Array<any> = []
  DuplicatethirdLevelSubGroups : Array<any> = []
  DuplicateSecondLevelSubGroups : Array<any> = []
  findSecondLevel : string = '';
  findThirdLevel : string = '';
  selectedSecLevelGroup : string = '';
  selectedThiLevelGroup : string = '';
  selectGroupName : string = ''
  isTableLoading : boolean = false;
  hideSecondSubGroups : boolean = false;
  onTopLevelGroup(){
    this.getUsers(this.main_group.id, 'second')
    this.currentSubGroups = [...this.DuplicateSecondLevelSubGroups];
    this.findSecondLevel = '';
    this.findThirdLevel = '';
    this.selectedSecLevelGroup = '';
    this.selectedThiLevelGroup = '';
    this.subgroups = true;
    this.users = false;
    this.hideGroupsTab = false;
    this.DuplicatethirdLevelSubGroups = [];
    this.selectGroupName = this.main_group.name;
  }
  getUsers(name:number, type ?: string){
    this.isTableLoading = true;
    this.subgroups = true;
    this.users = false;
    if(type == 'second'){

      this.teams.secondLevelUsers(name).subscribe((res : any)=>{
        console.log(res);
        if(res.status === 'success'){
          this.populateData(res);
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
          this.populateData(res);
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
      this.populateData(res);
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

  // Deleting Section
  @ViewChild('subGroupDelete') subGroupDelete: ElementRef;
  isGettingInfo : boolean = false
  isDeleting : boolean = false;
  deletingObject :any = {}
  getDeletingInfo(){
    this.isGettingInfo = true;
    console.log(this.GID);

    this._groups.deletingInfo(this.GID).subscribe((res:any)=>{
      console.log(res);
      if(res.status === 'success'){
        this.deletingObject = res.data;
        this.isGettingInfo = false;
        this.SubmitModal(this.subGroupDelete);
      }

    }, err=>{
      alert('something going wrong')
    })
  }
  onDeleteGroup(){
    this.isDeleting = true;
    this._groups.deletingGroup(this.GID).subscribe((res:any)=>{
      console.log(res);
      if(res.status === 'success'){
        this.modalService.dismissAll();
      this.modalText = 'Group is deleted.'
      this.onOpenToast();
        this.onDeleteGroupNode(res.data)

        this.originaleData.data.subgroups = this.originaleData.data.subgroups.filter((item,index)=>{
          return item.id != this.GID
        })
        this.copyTeamDetail = this.copyTeamDetail.filter(item => {
         return item.id != this.GID
        });
        this.applySorting()
        // this.GroupnameSort = 'acs'
        // this.onAscending();
        this.loadPagination(this.copyTeamDetail);
        if(this.totalPageCounter < this.currentPage){
          this.onPrevPagee();
        }
        this.status = 0;
        // this.modalService.dismissAll();
        this.isDeleting = false;
      }else{
        alert(res.message);
        this.isDeleting = false;
      }
      this.onBackpress();
    }, err=>{
      this.isDeleting = false;
      alert(err)
    })

  }
  deleteUser(){
    this.isDeleting = true;
    this._groups.deletingUser(this.UID).subscribe((res:any)=>{
      console.log(res);
      if(res.status === 'success'){
        this.modalService.dismissAll();
      this.modalText = 'User is deleted.'
      this.onOpenToast()
      this.originaleData.data.users = this.originaleData.data.users.filter((item,index)=>{
        return item.id != this.UID
      })
        this.copyuserDetail = this.copyuserDetail.filter(item=>{
          return item.id != this.UID
        });



    //     this.fnSort = 'acs'
    // this.onfnsort();
    this.applyUserSorting()
        this.userloadPagination(this.copyuserDetail);
        if(this.usertotalPageCounter < this.usercurrentPage){
          this.useronPrevPagee();
        }
        this.status = 0;
        this.isDeleting = false;
      }else{
        alert(res.message)
        this.isDeleting = false;
      }
      // this.modalService.dismissAll();
    })
  }
  modalReference: NgbModalRef;
  SubmitModal(content) {
  this.modalReference =   this.modalService.open(content, {
    ariaLabelledBy: 'modal-basic-title',
    windowClass: 'del-Modals'})
  this.modalReference.result.then(
      res => {
        this.closeModal = `Closed with: ${res}`;
      },
      res => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      }
    );
    // setTimeout(() => {
    //   this.modalReference.close();
    // }, 3000);
  }


  // ++++++++++++++++++++++++++++++++ Permission Modal




  @ViewChild('permissionModal') permissionModal: ElementRef;
  isGettingPermissionList : boolean = false;
  reportingAccessList : Array<Number> = []
  selectedAccessList : Array<any> = []
  accessAudio : boolean = false;
  scoreCalls : boolean = false;
  isUpdatingUserPermission : boolean = false;
  inputIsFocused : boolean = false;

  getCheckedUser(){
    this.isGettingPermissionList = true;
    this._groups.permittedUser(this.UID).subscribe((res:any)=>{
      console.log(res);
      if(res.status === 'success'){
        this.currentText = ''
        PERMISSION_TREE = res.data.group_list;
        this.treeData = PERMISSION_TREE;
        this._database.initializePermission();
        this.checkAll();
        this.reportingAccessList = res.data.reports_list
        this.reportingCheckbox();
        this.accessAudio = res.data.access_audio
        this.scoreCalls= res.data.score_call
        this.permissionModalTrigger(this.permissionModal)
        this.isGettingPermissionList = false;
      }else{
        alert(res.message)
      }

    }, err=>{
      alert(err)
    })
  }
  permissionModalTrigger(content) {
    this.Groupaccess = true;
    this.Reportingaccess = false;
    this.Audioscoring = false;
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'perm-Modals',
        scrollable: true,
        centered : true
      })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }

  onSavePermissionList(){
    this.isUpdatingUserPermission = true
    this.getGroups();
    // console.log(this.newCurrentArr);
    let obj : any = {
      id : this.UID,
      group_ids : this.allNodes,
      report_list : this.selectedAccessList,
      score_call : this.scoreCalls,
      access_audio : this.accessAudio
    }
    this._groups.updatePermission(obj).subscribe((res:any)=>{
      console.log(res);
      if(res.status === 'success'){
          this.modalService.dismissAll();
      }else{
        alert(res.message)
      }
      this.isUpdatingUserPermission = false
      this.onSearchReportAccess('');
}, err=>{
  alert(err)
})
  }
  reportingCheckbox(){
      this.reportingAccessBoxes.forEach(item=>{
        if(this.reportingAccessList.find(id => item.id == id)){
          item.isChecked = true;
          this.selectedAccessList.push(item.id)
        }else{
          item.isChecked = false;
        }
      });
  }
  tiggerAceessCheckbox(e, id){
    if(e){
      this.selectedAccessList.push(id)
    }else{
      this.selectedAccessList = this.selectedAccessList.filter(item=>{
        return item != id
      })
    }
  }


  // ========================= Filter Section

  // Subgroup filter
  groupFilterObj : any = {}
  onRefresh(){
    this.isTableLoading = true
    let obj : any = {}
    if(this.OUIDInputText){
      obj.ouid = this.selectedOUID + '~~' +  this.OUIDInputText
    }else{
      delete obj.ouid
    }
    if(this.GrpNameInputText){
      obj.group_name =this.selectedGrpName + '~~' + this.GrpNameInputText
    }else{
      delete obj.group_name
    }
    if(this.ExIDInputText){
      obj.external_id =this.selectedExID + '~~' + this.ExIDInputText
    }else{
      delete obj.external_id
    }
    if(this.IndustryInputText){
      obj.industry =this.selectedIndustry + '~~' + this.IndustryInputText
    }else{
      delete obj.industry
    }
    if(this.PhoneInputText){
      obj.phone =this.selectedPhone + '~~' + this.PhoneInputText
    }else{
      delete obj.phone
    }
    if(this.CityInputText){
      obj.city =this.selectedCity + '~~' + this.CityInputText
    }else{
      delete obj.city
    }
    if(this.StateInputText){
      obj.state =this.selectedState + '~~' + this.StateInputText
    }else{
      delete obj.state
    }
    if(this.ZipInputText){
      obj.zip =this.selectedZip + '~~' + this.ZipInputText
    }else{
      delete obj.zip
    }
    this.groupFilterObj = obj;
    obj.group_id = this.filterGroupID;
    console.log(obj);
    this._groups.subGroupFilter(obj).subscribe((res:any)=>{
      this.isTableLoading = false
      console.log(res);
      if(res.status === 'success'){
        this.subgroupData = [...res.data];
        console.log('subgroupData',this.subgroupData)
         TREE_DATA=this.subgroupData;
        //  this.originaleData.data.subgroups = this.originaleData.data.subgroups.filter(item=>{
        //   return item.id != this.UID
        // });
            // this.sortingCity();
            // this.sortingEXID();
            // this.sortingFirstName();
            // this.sortingGroupName();
            // this.sortingOUID();
            // this.sortingUserAgent();

        // console.log('SetAgain Groups',localStorage.getItem('groups'))
        // console.log('SetAgain Groups',localStorage.setItem('groups',))

        this.copyTeamDetail = [...res.data];
        this.itemLength = 25;
        this.lowerLimit = 0;
        this.uppreLimit = 25;
        this.currentPage = 1;
        this.applySorting()
        // this.GroupnameSort = 'acs'
        // this.onAscending();
        this.loadPagination(this.copyTeamDetail);
      }else{
        alert(res.message);
      }

    }, err=>{
      alert(err)
    })
  }
  clearRangeFilter(){
    this.GrpNameInputText = ''
    this.ExIDInputText = ''
    this.IndustryInputText = ''
    this.currentIndustry= ''
    this.OUIDInputText = ''
    this.ZipInputText = ''
    console.log('Clear----')

    this.currentState= ''
    this.StateInputText = ''
    this.CityInputText = ''
    this.PhoneInputText = ''
    this.isOUIDChecked = false
    this.isGroupNameChecked = false
    this.isExIDChecked = false
    this.isIndustryChecked = false
    this.isPhoneChecked = false
    this.isCityChecked = false
    this.isStateChecked = false
    this.isZipChecked = false;
    this.filterIndustryList = [...this.duplicateMangagers]
    this.selectedOUID = 'is'
    this.selectedGrpName = 'is'
    this.selectedExID = 'is'
    this.selectedIndustry = 'is'
    this.selectedPhone = 'is'
    this.selectedCity = 'is'
    this.selectedState = 'is'
    this.selectedZip = 'is';
    this.filterStateList= [...this.duplicateState]
      this.filterCanadaList= [...this.regionCanadaDuplicate]
      // this.subGroupsOUID = this.originaleData.data.subgroups.sort((a, b) => {
      //   return ('' + a.id).localeCompare(b.id)
      // });
    // this.subGroupsGrpName = this.originaleData.data.subgroups.sort((a, b) => {
    //   return ('' + a.name).localeCompare(b.name)
    // });
    // this.subGroupsExID = this.originaleData.data.subgroups.sort((a, b) => {
    //   return ('' + a.group_ext_id).localeCompare(b.group_ext_id)
    // });
    // this.subGroupsPhone = this.originaleData.data.subgroups.sort((a, b) => {
    //   return ('' + a.phone_number).localeCompare(b.phone_number)
    // });
    // this.subGroupsCity = this.originaleData.data.subgroups.sort((a, b) => {
    //   return ('' + a.city).localeCompare(b.city)
    // });
    // this.subGroupsZip = this.originaleData.data.subgroups
    this.checkCounter();
    this.onRefresh()
  }

  isSubGroupFilters : boolean = false;
  isFilterList : boolean = false;
  isOUIDChecked : boolean = false;
  isGroupNameChecked : boolean = false;
  isExIDChecked : boolean = false;
  isPhoneChecked : boolean = false;
  isCityChecked : boolean = false;
  isStateChecked : boolean = false;
  isZipChecked : boolean = false;

  isopenedOUIDF : boolean = false
  OUIDRangeFilter : boolean = false
  currentOUID : string = ''
  OUIDInputText : string = ''
  selectedOUID : string = 'is'
  subGroupFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters;
    if(!this.isSubGroupFilters){
      this.clearRangeFilter();
      this.onRefresh();
    }
  }
  checktiggerOUID(e) {
    setTimeout(() => {
      this.isopenedOUIDF = e;
    }, 100);
  }

  closeDropsOUID(){
    if (!this.isopenedOUIDF) {
      this.OUIDRangeFilter = false;
    }
  }
  selectOUID(e){
    this.OUIDInputText = e;
  }
  focusList8 = -1
  OUIDInputBox : boolean = false;
  onSearchFilterOUID(e) {
    this.OUIDInputText = e;
    this.subGroupsOUID = this.originaleData.data.subgroups.filter(item => {
      let i:string = String(item.id);
      if (i.includes(e)) {
        return item;
      }
    });

    this.subGroupsOUID.sort((a, b) => {
      return (a.id) - (b.id)
    });
  }
  onUpDownOUID(e: KeyboardEvent) {
    let list = this.subGroupsOUID.length;
    let element: string = '#OUID_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList8 + 1;
      if (count === list) {
        return;
      }
      this.focusList8++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList8
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList8 - 1;
      if (count === -1) {
        return;
      }
      this.focusList8--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList8
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.subGroupsOUID[this.focusList8]?.id;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }



  isopenedGrpNameF : boolean = false
  GrpNameRangeFilter : boolean = false
  currentGrpName : string = ''
  GrpNameInputText : string = ''
  selectedGrpName : string = 'is'
  GrpNameFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsGrpName(){
    if (!this.isopenedGrpNameF) {
      this.GrpNameRangeFilter = false;
    }
  }
  selectGrpName(e){
    this.GrpNameInputText = e;
  }
  checktiggerGrpName(e) {
    setTimeout(() => {
      this.isopenedGrpNameF = e;
    }, 100);
  }
  focusList9 = -1
  GrpNameInputBox : boolean = false;
  onSearchFilterGrpName(e) {
    this.GrpNameInputText = e;
    this.subGroupsGrpName = this.originaleData.data.subgroups.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(e)) {
        return item;
      }
    });
    this.subGroupsGrpName.sort((a, b) => {
      return ('' + a.name).localeCompare(b.name)
    });
  }
  onUpDownGrpName(e: KeyboardEvent) {
    let list = this.subGroupsGrpName.length;
    let element: string = '#GrpName_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList9 + 1;
      if (count === list) {
        return;
      }
      this.focusList9++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList9
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList9 - 1;
      if (count === -1) {
        return;
      }
      this.focusList9--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList9
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.subGroupsGrpName[this.focusList9]?.first_name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }



  isopenedExIDF : boolean = false
  ExIDRangeFilter : boolean = false
  currentExID : string = ''
  ExIDInputText : string = ''
  selectedExID : string = 'is'
  ExIDFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsExID(){
    if (!this.isopenedExIDF) {
      this.ExIDRangeFilter = false;
      this.ExIDInputBox = false
    }
  }
  checktiggerExID(e) {
    setTimeout(() => {
      this.isopenedExIDF = e;
    }, 100);
  }
  focusList10 = -1
  ExIDInputBox : boolean = false;
  onSearchFilterExID(e) {
    this.ExIDInputText = e;
    this.subGroupsExID = this.originaleData.data.subgroups.filter(item => {
      let i:string = item.group_ext_id?.toString().toLowerCase();
      if (i?.includes(String(e))) {
        return item;
      }
    });
    this.subGroupsExID.sort((a, b) => {
      return (a.group_ext_id)-(b.group_ext_id)
    });

  }
  onUpDownExID(e: KeyboardEvent) {
    let list = this.subGroupsExID.length;
    let element: string = '#ExID_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList8 + 1;
      if (count === list) {
        return;
      }
      this.focusList8++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList8
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList8 - 1;
      if (count === -1) {
        return;
      }
      this.focusList8--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList8
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.subGroupsExID[this.focusList8]?.group_ext_id;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }




  isopenedIndustryF : boolean = false
  isIndustryChecked : boolean = false
  IndustryRangeFilter : boolean = false
  IndustryInputBox : boolean = false
  currentIndustry : string = ''
  IndustryInputText : string = ''
  selectedIndustry : string = 'is'

  IndustryFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsIndustry(){
    if (!this.isopenedIndustryF) {
      this.IndustryRangeFilter = false;
      this.IndustryInputBox = false;
    }
  }
  selectIndustry(e){
    this.IndustryInputText = e;
  }
  checktiggerIndustry(e) {
    setTimeout(() => {
      this.isopenedIndustryF = e;
    }, 100);
  }
  onSearchIndustry(e: string) {
    this.IndustryInputText = e;
    this.filterIndustryList = this.duplicateMangagers.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(e.toLowerCase())) {
        return item;
      }
    });
  }
  onUpDownIndustry(e: KeyboardEvent) {
    let list = this.filterIndustryList.length;
    let element: string = '#people_';
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
        let i = this.filterIndustryList[this.focusList]?.name;
        if (i) {
          this.IndustryInputText = i;
          this.currentIndustry = i;
         this.IndustryInputBox = false
         this.IndustryRangeFilter = false
        } else {
          return;
        }
    }
  }




  isopenedPhoneF : boolean = false
  PhoneRangeFilter : boolean = false
  currentPhone : string = ''
  PhoneInputText : string = ''
  selectedPhone : string = 'is'
  PhoneFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsPhone(){
    if (!this.isopenedPhoneF) {
      this.PhoneRangeFilter = false;
    }
  }
  selectPhone(e){
    this.PhoneInputText = e;
  }
  focusList11 = -1
  PhoneInputBox : boolean = false;
  onSearchFilterPhone(e) {
    this.PhoneInputText = e;
    this.subGroupsPhone = this.originaleData.data.subgroups.filter(item => {
      let i:string = item.phone_number?.toLowerCase();
      if (i?.includes(String(e))) {
        return item;
      }
    });
    this.subGroupsPhone.sort((a, b) => {
      return ('' + a.phone_number).localeCompare(b.phone_number)
    });
  }
  checkCounter(){
    this.Counter = 0
    if(this.isOUIDChecked){
     this.Counter += 1
    }
    if(this.isGroupNameChecked){
      this.Counter += 1
     }
     if(this.isExIDChecked){
      this.Counter += 1
     }
     if(this.isIndustryChecked){
      this.Counter += 1
     }
     if(this.isPhoneChecked){
      this.Counter += 1
     }
     if(this.isCityChecked){
      this.Counter += 1
     }
     if(this.isStateChecked){
      this.Counter += 1
     }
     if(this.isZipChecked){
      this.Counter += 1
     }
  }
  checkCounterUser(){
    this.CounterUser = 0
    if(this.isFNameChecked){
     this.CounterUser += 1
    }
    if(this.isLNameChecked){
      this.CounterUser += 1
     }
     if(this.isEmailChecked){
      this.CounterUser += 1
     }
     if(this.isUserExIDChecked){
      this.CounterUser += 1
     }
     if(this.isAgentIDChecked){
      this.CounterUser += 1
     }
     if(this.isRoleChecked){
      this.CounterUser += 1
     }
     if(this.isStatusChecked){
      this.CounterUser += 1
     }
     if(this.isScoringStatusChecked){
      this.CounterUser += 1
     }
  }
  onUpDownPhone(e: KeyboardEvent) {
    console.log('KeyDown')
    let list = this.subGroupsPhone.length;
    let element: string = '#Phone_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList11 + 1;
      if (count === list) {
        return;
      }
      this.focusList11++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList11
      );
      // console.log('el',el)
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList11 - 1;
      if (count === -1) {
        return;
      }
      this.focusList11--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList11
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.subGroupsPhone[this.focusList11]?.phone_number;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }



  isopenedCityF : boolean = false
  CityRangeFilter : boolean = false
  currentCity : string = ''
  CityInputText : string = ''
  selectedCity : string = 'is'
  CityFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }
  checktiggerCity(e) {
    setTimeout(() => {
      this.isopenedCityF = e;
    }, 100);
  }

  closeDropsCity(){
    if (!this.isopenedCityF) {
      this.CityRangeFilter = false;
    }
  }
  selectCity(e){
    this.CityInputText = e;
  }
  focusList12 = -1
  CityInputBox : boolean = false;
  onSearchFilterCity(e) {
    this.CityInputText = e;
    this.subGroupsCity = this.originaleData.data.subgroups.filter(item => {
      let i:string = item.city?.toLowerCase();
      if (i?.includes(String(e))) {
        return item;
      }
    });
    this.subGroupsCity =this.subGroupsCity.sort((a: any, b: any) => {
        return ('' + a.city).localeCompare(b.city);
      })
  }
  onUpDownCity(e: KeyboardEvent) {
    let list = this.subGroupsCity.length;
    let element: string = '#City_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList12 + 1;
      if (count === list) {
        return;
      }
      this.focusList12++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList12
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList12 - 1;
      if (count === -1) {
        return;
      }
      this.focusList12--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList12
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.subGroupsCity[this.focusList12]?.city;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }



  isopenedStateF : boolean = false
  StateRangeFilter : boolean = false
  StateInputBox : boolean = false
  currentFilterState : string = ''
  StateInputText : string = ''
  selectedState : string = 'is'
  focusList1 : number = -1
  StateFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsState(){
    if (!this.isopenedStateF) {
      this.StateRangeFilter = false;
      this.StateInputBox = false;
    }
  }
  selectState(e){
    this.StateInputText = e;
  }
  checktiggerState(e) {
    setTimeout(() => {
      this.isopenedStateF = e;
    }, 100);
  }
  onSearchFilterState(e) {
    this.StateInputText = e;
    this.filterStateList = this.duplicateState.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(e)) {
        return item;
      }
    });
    this.filterCanadaList = this.regionCanadaDuplicate.filter(item => {
      let i:string = item.name.toLowerCase();
      if (i.includes(e)) {
        return item;
      }
    });
  }
  onUpDownState(e: KeyboardEvent) {
    let list = this.filterStateList.length;
    let element: string = '#state_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList1 + 1;
      if (count === list) {
        return;
      }
      this.focusList1++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList1
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList1 - 1;
      if (count === -1) {
        return;
      }
      this.focusList1--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList1
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.filterStateList[this.focusList1]?.name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }





  isopenedZipF : boolean = false
  ZipRangeFilter : boolean = false
  currentZip : string = ''
  ZipInputText : string = ''
  selectedZip : string = 'is'
  ZipFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsZip(){
    if (!this.isopenedZipF) {
      this.ZipRangeFilter = false;
    }
  }
  selectZip(e){
    this.ZipInputText = e;
  }
  checktiggerZip(e) {
    setTimeout(() => {
      this.isopenedZipF = e;
    }, 100);
  }
  focusList13 = -1
  ZipInputBox : boolean = false;
  onSearchFilterZip(e) {
    this.ZipInputText = e;
    this.subGroupsZip = this.originaleData.data.subgroups.filter(item => {
      let i:string = item.zip?.toString()?.toLowerCase();
      if (i?.includes(String(e))) {
        return item;
      }
    });
    this.subGroupsZip.sort((a: any, b: any) => {
      return ('' + a.zip).localeCompare(b.zip);
    })
  }
  onUpDownZip(e: KeyboardEvent) {
    let list = this.subGroupsZip.length;
    let element: string = '#Zip_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList12 + 1;
      if (count === list) {
        return;
      }
      this.focusList12++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList12
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList12 - 1;
      if (count === -1) {
        return;
      }
      this.focusList12--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList12
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.subGroupsZip[this.focusList12]?.zip;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }






  // ====================================  User filter



  isUserFilters : boolean = false;
  UserFilter(){
    this.isUserFilters = !this.isUserFilters
    if(!this.isUserFilters){
      this.clearUserFilter();
      this.onUserRefresh();
    }
  }
  onUserRefresh(){
    this.isTableLoading = true
    let obj : any = {}
    if(this.FNameInputText){
        obj.first_name =this.selectedFName + '~~' + this.FNameInputText
    }else{
      delete obj.first_name
    }
    if(this.LNameInputText){
        obj.last_name =this.selectedLName + '~~' + this.LNameInputText
    }else{
      delete obj.last_name
    }
    if(this.EmailInputText){
        obj.email =this.selectedEmail + '~~' + this.EmailInputText
    }else{
      delete obj.email
    }
    if(this.UserExIDInputText){
        obj.user_ext_id =this.selectedUserExID + '~~' + this.UserExIDInputText
    }else{
      delete obj.user_ext_id
    }
    if(this.AgentIDInputText){
        obj.agent_id = this.selectedAgentID + '~~' + String(this.AgentIDInputText)
    }else{
      delete obj.agent_id
    }
    if(this.RoleInputText){
      let role = this.RoleInputText == "Admin" ? '1' : ''  || this.RoleInputText == "Manager" ? '2' : '' || this.RoleInputText == "User" ? '3' : '' || this.RoleInputText == "Identified-only" ? 8 : ''
      obj.role_id =  this.selectedRole + '~~' + role
     }else{
      delete obj.role_id
    }
    if(this.StatusInputText){
      obj.status = this.StatusInputText
    }else{
      delete obj.status
    }
    if(this.ScoringStatusInputText){
      obj.score_status = this.ScoringStatusInputText === 'Enabled' ? 'yes' : 'no';
    }else{
      delete obj.scoringstatus
    }
    obj.group_id = this.filterGroupID;
    console.log(obj);

    this._groups.userFilter(obj).subscribe((res:any)=>{
      this.isTableLoading = false
      console.log(res);
      if(res.status === 'success'){
        this.usersData = res.data;
        this.copyuserDetail = res.data;
      this.useritemLength = 25;
      this.userlowerLimit = 0;
      this.useruppreLimit = 25;
      this.usercurrentPage = 1;
      // this.fnSort = 'acs'
      // this.onfnsort();
      this.applyUserSorting();
        this.userloadPagination(this.copyuserDetail);
      }else{
        alert(res.message)
      }

    })
  }
  clearUserFilter(){
    this.isFNameChecked = false
    this.isLNameChecked = false
    this.isEmailChecked = false
    this.isUserExIDChecked = false
    this.isAgentIDChecked = false
    this.isRoleChecked = false
    this.isStatusChecked = false
    this.FNameInputText = '';
    this.LNameInputText = '';
    this.EmailInputText = '';
    this.UserExIDInputText = '';

    this.AgentIDInputText = '';
    this.RoleInputText = '';
    this.StatusInputText = '';
    this.selectedFName = 'is'
    this.selectedLName = 'is'
    this.selectedEmail = 'is'
    this.selectedUserExID = 'is'
    this.selectedAgentID = 'is'
    this.selectedRole = 'is'
    // this.userFirstName =this.originaleData.data.users.sort((a: any, b: any) => {
    //   return ('' + a.first_name).localeCompare(b.first_name);
    // });
    // this.userLastName =this.originaleData.data.users.sort((a: any, b: any) => {
    //   return ('' + a.last_name).localeCompare(b.last_name);
    // })
    // this.userEmail =this.originaleData.data.users.sort((a: any, b: any) => {
    //   return ('' + a.email).localeCompare(b.email);
    // })
    // this.userExID =this.originaleData.data.users
    // this.userAgentID =this.originaleData.data.users
    this.checkCounterUser();
    this.onUserRefresh();
  }


isopenedFNameF : boolean = false
isFNameChecked : boolean = false
FNameRangeFilter : boolean = false
  currentFName : string = ''
  FNameInputText : string = ''
  selectedFName : string = 'is'

  closeDropsFName(){
    if (!this.isopenedFNameF) {
      this.FNameRangeFilter = false;
    }
  }
  selectFName(e){
    this.FNameInputText = e;
  }
  checktiggerFName(e) {
    setTimeout(() => {
      this.isopenedFNameF = e;
    }, 100);
  }
  focusList3 = -1
  FNameInputBox : boolean = false;
  onSearchFilterFName(e) {
    this.FNameInputText = e;
    this.userFirstName = this.originaleData.data.users.filter(item => {
      let i:string = item.first_name.toLowerCase();
      if (i.includes(e)) {
        return item;
      }
    });
    this.userFirstName = this.userFirstName.sort((a: any, b: any) => {
      return ('' + a.first_name).localeCompare(b.first_name);
    });
  }
  onUpDownFName(e: KeyboardEvent) {
    let list = this.userFirstName.length;
    let element: string = '#FName_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList3 + 1;
      if (count === list) {
        return;
      }
      this.focusList3++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList3
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList3 - 1;
      if (count === -1) {
        return;
      }
      this.focusList3--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList3
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.userFirstName[this.focusList3]?.first_name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }



  isopenedLNameF : boolean = false
  isLNameChecked : boolean = false
  LNameRangeFilter : boolean = false
  currentLName : string = ''
  LNameInputText : string = ''
  selectedLName : string = 'is'
  LNameFilter(){
    this.isSubGroupFilters = !this.isSubGroupFilters
  }

  closeDropsLName(){
    if (!this.isopenedLNameF) {
      this.LNameRangeFilter = false;
    }
  }
  selectLName(e){
    this.LNameInputText = e;
  }
  checktiggerLName(e) {
    setTimeout(() => {
      this.isopenedLNameF = e;
    }, 100);
  }
  focusList4 = -1
  LNameInputBox : boolean = false;
  onSearchFilterLName(e) {
    this.LNameInputText = e;
    this.userLastName = this.originaleData.data.users.filter(item => {
      let i:string = item.last_name.toLowerCase();
      if (i.includes(e)) {
        return item;
      }
    });
    this.userLastName = this.userLastName.sort((a: any, b: any) => {
      return ('' + a.last_name).localeCompare(b.last_name);
    });
  }
  onUpDownLName(e: KeyboardEvent) {
    let list = this.userLastName.length;
    let element: string = '#LName_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList3 + 1;
      if (count === list) {
        return;
      }
      this.focusList3++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList3
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList3 - 1;
      if (count === -1) {
        return;
      }
      this.focusList3--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList3
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.userLastName[this.focusList3]?.first_name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }


  isopenedEmailF : boolean = false
  EmailRangeFilter : boolean = false
  isEmailChecked : boolean = false
  currentEmail : string = ''
  EmailInputText : string = ''
  selectedEmail : string = 'is'

  closeDropsEmail(){
    if (!this.isopenedEmailF) {
      this.EmailRangeFilter = false;
    }
  }
  selectEmail(e){
    this.EmailInputText = e;
  }
  checktiggerEmail(e) {
    setTimeout(() => {
      this.isopenedEmailF = e;
    }, 100);
  }
  focusList5 = -1
  EmailInputBox : boolean = false;
  onSearchFilterEmail(e) {
    this.EmailInputText = e;
    this.userEmail = this.originaleData.data.users.filter(item => {
      let i:string = item.email.toLowerCase();
      if (i.includes(e)) {
        return item;
      }
    });
    this.userEmail.sort((a, b) => {
      return ('' + a.email).localeCompare(b.email)
    });
  }
  onUpDownEmail(e: KeyboardEvent) {
    let list = this.userEmail.length;
    let element: string = '#Email_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList3 + 1;
      if (count === list) {
        return;
      }
      this.focusList3++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList3
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList3 - 1;
      if (count === -1) {
        return;
      }
      this.focusList3--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList3
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.userEmail[this.focusList3]?.first_name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }


 isopenedUserExIDF : boolean = false
  UserExIDRangeFilter : boolean = false
  isUserExIDChecked : boolean = false
  currentUserExID : string = ''
  UserExIDInputText : string = ''
  selectedUserExID : string = 'is'

  closeDropsUserExID(){
    if (!this.isopenedUserExIDF) {
      this.UserExIDRangeFilter = false;
    }
  }
  selectUserExID(e){
    this.UserExIDInputText = e;
  }
  checktiggerUserExID(e) {
    setTimeout(() => {
      this.isopenedUserExIDF = e;
    }, 100);
  }
  focusList6 = -1
  UserExIDInputBox : boolean = false;
  onSearchFilterUserExID(e) {
    this.UserExIDInputText = e;
    this.userExID = this.originaleData.data.users.filter(item => {
      let i:string = String(item?.user_ext_id)?.toLowerCase();

      if (i?.includes(String(e))) {
        return item;
      }
    });
    this.userExID.sort((a, b) => {
      return ('' + a.user_ext_id).localeCompare(b.user_ext_id)
    });
  }
  onUpDownUserExID(e: KeyboardEvent) {
    let list = this.userExID.length;
    let element: string = '#ExID_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList6 + 1;
      if (count === list) {
        return;
      }
      this.focusList6++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList6
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList6 - 1;
      if (count === -1) {
        return;
      }
      this.focusList6--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList6
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.userExID[this.focusList6]?.first_name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }

  isopenedAgentIDF : boolean = false
  AgentIDRangeFilter : boolean = false
  isAgentIDChecked : boolean = false
  currentAgentID : string = ''
  AgentIDInputText : string = ''
  selectedAgentID : string = 'is'

  closeDropsAgentID(){
    if (!this.isopenedAgentIDF) {
      this.AgentIDRangeFilter = false;
    }
  }
  selectAgentID(e){
    this.AgentIDInputText = e;
  }
  checktiggerAgentID(e) {
    setTimeout(() => {
      this.isopenedAgentIDF = e;
    }, 100);
  }
  focusList7 = -1
  AgentIDInputBox : boolean = false;
  onSearchFilterAgentID(e) {
    this.AgentIDInputText = e;
    this.userAgentID = this.originaleData.data.users.filter(item => {
      let i:string = String(item?.agent_id)
      if (i?.includes(e)) {
        return item;
      }
    });
    this.userAgentID.sort((a, b) => {
      return ( a.agent_id)-(b.agent_id)
    });
  }
  onUpDownAgentID(e: KeyboardEvent) {
    let list = this.userAgentID.length;
    let element: string = '#AgentID_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList7 + 1;
      if (count === list) {
        return;
      }
      this.focusList7++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList7
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList7 - 1;
      if (count === -1) {
        return;
      }
      this.focusList7--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList7
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
        let i = this.userAgentID[this.focusList7]?.first_name;
        if (i) {
          this.StateInputText = i;
          this.currentState = i;
         this.StateInputBox = false
         this.StateRangeFilter = false
        } else {
          return;
        }
    }
  }


  isopenedRoleF : boolean = false
  RoleRangeFilter : boolean = false
  isRoleChecked : boolean = false
  currentRole : string = ''
  RoleInputText : string = ''
  selectedRole : string = 'is'

  closeDropsRole(){
    if (!this.isopenedRoleF) {
      this.RoleRangeFilter = false;
    }
  }
  checktiggerScore(e) {
    setTimeout(() => {
      this.isopenedRoleF = e;
    }, 100);
  }
  selectRole(e){
    this.RoleInputText = e;
  }
  checktiggerRole(e) {
    setTimeout(() => {
      this.isopenedRoleF = e;
    }, 100);
  }



  isopenedStatusF : boolean = false
  isscoreopenedStatusF : boolean = false
  StatusRangeFilter : boolean = false
  ScoringStatusRangeFilter : boolean = false
  isStatusChecked : boolean = false
  isScoringStatusChecked : boolean = false


  currentStatus : string = ''
  StatusInputText : string = ''
  ScoringStatusInputText : string = ''
  selectedStatus : string = 'is'
  selectedScoringStatus : string = 'is'


  closeDropsStatus(){
    if (!this.isopenedStatusF) {
      this.StatusRangeFilter = false;

    }
  }

  closeDropsScoringStatus(){
    if (!this.isscoreopenedStatusF) {
      this.ScoringStatusRangeFilter = false;

    }
  }
  selectStatus(e){
    this.StatusInputText = e;
  }
  checktiggerMissed(e) {
    setTimeout(() => {
      this.isscoreopenedStatusF = e;
    }, 100);
  }


  selectScoringStatus(e){
    this.ScoringStatusInputText = e;
  }
  checktiggerScored(e) {
    setTimeout(() => {
      this.isscoreopenedStatusF = e;
    }, 100);
  }
  toastText : string = 'This is the toast'
  isToastActive : boolean = false;
  onToastClose(){
    this.toastText = '';
    this.isToastActive = false;
  }
  onOpenToast(){
    this.isToastActive = true;
    setTimeout(() => {
      this.isToastActive = false;
    }, 5000);
  }
  isDeactivting : boolean = false;
  deavtivatingID : number
  onDeactivate(e, isChecked: boolean){
    this.isDeactivting = true;
    if(isChecked){
      this._groups.deactivateUser(e, 'Active').subscribe((res:any)=> {
        console.log(res);
        this.isDeactivting = false;
        this.copyuserDetail.forEach((item, index)=>{
          if(item.id == this.UID){
            this.copyuserDetail[index] = res.data;
          }
        });
        this.usersData =[...this.copyuserDetail];
        // this.fnSort = 'acs'
        // this.onfnsort();
        this.applyUserSorting();
        this.userloadPagination(this.copyuserDetail);

      })
    }else{
      this._groups.deactivateUser(e, 'Inactive').subscribe((res:any)=>{
        console.log(res);
        this.isDeactivting = false;
        this.copyuserDetail.forEach((item, index)=>{
          if(item.id == this.UID){
            this.copyuserDetail[index] = res.data;
          }
        });
        this.usersData =[...this.copyuserDetail];
        // this.fnSort = 'acs'
        // this.onfnsort();
        this.applyUserSorting();
        this.userloadPagination(this.copyuserDetail);

      })
    }
    // if(confirm(`Do you want to  ${e.status === 'Active' ? 'Deactivte':'Activate'} the user?`) == true){
    //   this.deavtivatingID = e.id
    //   this.isDeactivting = true
    //   let status = e.status === 'Active' ? 'Inactive':'Active'
    //   this._groups.deactivateUser(e.id, status).subscribe((res:any)=>{
    //     console.log(res);
    //     this.isDeactivting = false
    //     if(res.status === 'success'){
    //       if(list === 'user'){
    //         this.usersData = this.usersData.map(item=>{
    //           if(item.id === e.id){
    //             item.status = item.status === 'Active' ? 'Inactive':'Active'
    //           }
    //           return item
    //         })
    //       }else{
    //         this.currentTeamsUsers = this.currentTeamsUsers.map(item=>{
    //           if(item.id === e.id){
    //             item.status = item.status === 'Active' ? 'Inactive':'Active'
    //           }
    //           return item
    //         })
    //       }
    //     }

    //   })
    // }
  }

  selectedTime : any
  calCount1 = 1;
  idDownloadingUserCSV : boolean = false
  change(data) {
    if(this.idDownloadingUserCSV){
      return
    }
    if(data.startDate){
      let startDate = moment(data.startDate?._d).format('MM/DD/YY');
      let endDate = moment(data.endDate?._d).format('MM/DD/YY');
      console.log(startDate, endDate);
      this.idDownloadingUserCSV= true
      delete this.groupFilterObj.group_id
      let obj = {group_id : this.filterGroupID, start_date : startDate, end_date : endDate, ...this.groupFilterObj}
      this._groups.getCSVData(obj).subscribe((res:any)=>{
        console.log(res);
        if(res.status === 'success'){
          let Data : Array<object> = []
          let obj: any = {}
          res.data.users.forEach(item=>{
            obj = {};
            obj['FIRST NAME']=item.first_name ? item.first_name : '';
            obj['LAST NAME']=item.last_name ? item.last_name : '';
            obj['E-MAIL']=item.email ? item.email : '';
            obj['EXTERNAL ID']=item.user_ext_id ? item.user_ext_id : '';
            obj['AGENT ID']=item.agent_id ? item.agent_id : '';
            obj['ROLE']=item.role_id == 1 ? 'Admin': item.role_id == 2 ? 'Standard' :item.role_id == 8 ? 'Identified-only' : 'Read-only';
            obj['STATUS']=item.status ? item.status : '';
            obj['Group']=item.group_name ? item.group_name : '';
            obj['Group OUID']=item.groupId ? item.groupId : '';
            obj['Group External ID']=item.group_ext_id ? item.group_ext_id : '';
            obj['Access Audio']=item.user_access_audio ? 'Yes' : 'No';

            obj['Scored calls status']=item.user_access_score_calls ? 'Yes' : 'No';

            obj['Score calls']=item.scoredCalls;
            obj['Assign scorecard status']=item.assign_scorecard ? 'Yes' : 'No';
            obj['Assign scorecard status date']=item.assign_scorecard_inactive_date;
            obj['Created at']=item.created_at ? item.created_at : '';
            obj['Updated at']=item.updated_at ? item.updated_at : '';
            obj['Role updated at']=item.role_updated_at ? item.role_updated_at : '';
            Data.push(obj);
          });
          this.exportToCsv('Scored Users', Data)
          this.idDownloadingUserCSV= false
        }else{
          this.idDownloadingUserCSV= false
          alert(res.message)
        }
      })
    }
  }
}





declare global {
  interface Navigator {
    msSaveBlob: (blob: any, defaultName?: string) => boolean;
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
