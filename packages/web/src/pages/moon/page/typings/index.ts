/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/6/4
 **/

export enum EInterActType {
  input = 'input',
  actionChoose = 'action',
  actionMethodChoose = 'actionMethod',
  checkboxChoose = 'checkbox',
  radioChoose = 'radio',
  actorChoose = 'actor',
  arrayChoose = 'array',
  actorDataChoose = 'actorData',
  actorEventChoose = 'actorEvent',
  compChoose = 'comp',
  compMethodChoose = 'comp-method',
  objectChoose = 'object',
  booleanChoose = 'boolean',
  apiMethodTypeChoose = 'api-method-type',
  apiMethodChoose = 'api-method',
}


export interface IActionInfo {
  actionIndex:number;
  actionName:string;
}


export interface IActionMethodInfo extends IActionInfo{
  methodInfo:IMethodDef,
  methodIndex:number;
}


export interface IActorInfo {
  actorIndex:number;
  actorName:string;
}

export interface ApiMethodInfo {
  apiFile: string;
  methodName: string;
}

/**
 * //分别对应 controller methods response ...
 * import {} from 'webapi/controller'
 */
export interface ImportInfo extends ApiMethodInfo {
  interfaceName: string;
  isArray: boolean;
}

export interface IActorData {
  //变量名
  name: string;
  //变量默认值;
  value?: any;
  /*
  internal:额外定义schema  ==> typeName  schema
  import: 引用处部定义  ==>importInfo
  fromValue:通过默认值自动生成 =>typeName  schema
  */
  schemaType: 'internal' | 'import' | 'fromValue'
  importInfo?: ImportInfo;
}

export type IActorEvent = IMethodDef;

export interface IMethodDef {
  name: string;
  comment?: string;
  content?: string;
  param?: string;
}

export interface ISubCompDef {
  fileName: string;
  methods: IMethodDef[];
  imports: string;
  style: string;
}

export interface IPageInfo {
  pagePath?: string;
  actors: [
    {
      fileName: string;
      datas: IActorData[],
      events: IActorEvent[],
    }
    ],
  actions: [
    {
      fileName: string;
      methods: IMethodDef[],
    }
    ],
  subComps: ISubCompDef[],
  lifeCycles: {
    init: IMethodDef,
    clean: IMethodDef,
  },

  mainComp: {
    methods: IMethodDef[];
    imports: string;
    style: string;
  }
}

export interface IActorDataItemInfo extends IActorInfo{
  actorData: IActorData;
  dataIndex:number;
}

export interface IActorEventInfo extends IActorInfo{
  eventData: IActorEvent;
  eventIndex:number;
}


export interface ICompInfo {
  compIndex: number;
  compName: string;
}

export interface ICompMethodInfo extends ICompInfo{
  methodName: string;
  methodIndex: number;
}


export interface IBooleanResult<T=any> {
  checked:boolean;
  value?:T;
}
