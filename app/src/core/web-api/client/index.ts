/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/3/26
 **/

import * as ejs from 'ejs';
import {join} from 'path';
import {insertContent, getHandleFile} from "../../util/compile-util";
import * as stringUtil from "../../util/string-util";
import { compile, compileFromFile } from 'json-schema-to-typescript'

const Util = {
  ...stringUtil,

  /**
   * 生成ts interface 名称
   * @param names
   */
  genInterfaceName(...names) {
    return `I${stringUtil.toUCamelize(names.join("-"))}`
  }
}
/**
 * 对于接口的定义
 */
interface IWebApiDefinded {
  url:string;
  name:string;
  comment:string;
  requestParam:IParamShape[];
  responseParam:ITypeShape;
}

//TODO 参数生成要确定下来..

interface IWebApiGroup {
  name:string;
  apis:IWebApiDefinded[];
}

(async()=>{

  let a :IWebApiDefinded = {
    url:"/area/info",
    name:'info',
    comment:'获取地区详细信息',
    requestParam:[
      {
        name:"areaReq",
        comment:"这是备注信息",
        jsonSchema:{
          type:'object',
          properties:{
            level:{
              type:"integer",//TODO 枚举类型处理
            },
            id:{
              type:"integer",//TODO 枚举类型处理
            }
          }
        }
      }
    ],
    responseParam: {
      comment:"地区信息返回值",
      jsonSchema: {
        type:"array",
        items: {
          type:"object",
          properties:{
            id:{
              type:"number",
            },
            mname:{
              type:"string",
            },
            code:{
              type:"number",
            },
            lever:{
              type:"number",
            },
            fid:{
              type:"number",
            },
            create_time:{
              type:"string",
            },
            mod_time:{
              type:"string",
            },
            flag:{
              type:"number",
            },
            type:{
              type:"number",
            },
            company:{
              type:"number",
            },
          }
        }
      }
    }
  };

  let webapiGroup :IWebApiGroup = {
    name:"area",
    apis:[a]
  };
  console.log(webapiGroup);

  let outDir = join(__dirname,"out");

  let fileHandle  = getHandleFile({outDir,tplBase:join(__dirname,"tpl")});


  //生成 方法入参入出参的ts定义;

  let tsDefinded = await generateTsDefined(webapiGroup);

  //本项目公共的 ts定义;
  await fileHandle("api.ts.ejs",async (tplConent)=>{
    let conent = ejs.render(tplConent, {
      // ...base,
      Util,
      webapiGroup,
      tsDefinded
    });
    return conent;
  },{saveFilePath:webapiGroup.name+".ts"});
})();


async function generateTsDefined(webapiGroup :IWebApiGroup):Promise<string>{

  let results  =[];

  for (let i = 0, ilen = webapiGroup.apis.length; i < ilen; i++) {
    let apiItem:IWebApiDefinded = webapiGroup.apis[i];

    for (let i = 0, ilen = apiItem.requestParam.length; i < ilen; i++) {
      let param:IParamShape = apiItem.requestParam[i];
      let result  =  await compile(param.jsonSchema as any ,Util.genInterfaceName(apiItem.name,param.name,"req"));
      results.push(result);
    }

    if(apiItem.responseParam.jsonSchema) {
      let result  =  await compile(apiItem.responseParam.jsonSchema as any ,Util.genInterfaceName(apiItem.name,"res"));
      results.push(result);
    }
  }
  return results.join('\n');
}



interface IJsonSchemaProps{
  description?:string;
}


//https://json-schema.org/latest/json-schema-validation.html#numeric
interface INumberValidates{
  exclusiveMaximum?:number;
  exclusiveMinimum?:number;
  minimum?:number;
  multipleOf?:number;
  maximum?:number;
}

interface IJSIntegerProps extends IJsonSchemaProps,INumberValidates{
  type:"integer"
}

interface IJSNumberProps extends IJsonSchemaProps,INumberValidates{
  type:"number";
}


//https://json-schema.org/latest/json-schema-validation.html#string
interface JSStringProps extends IJsonSchemaProps{
  type:"string";
  maxLength?:string;
  minLength?:string;
  pattern?:string;
}

//https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4
interface IJSArrayProps extends IJsonSchemaProps{
  type:'array';
  //如果type是数组要
  // 定义子组件的属性;
  items:SchemaProps;
  // 定义最少数量
  minItems?:number;
  maxItems?:number;
  // 是否可以重复
  uniqueItems?:boolean;
}


interface IJSObjectProps extends IJsonSchemaProps{
  type:'object';
  maxProperties?:number;
  minProperties?:number;
  properties:{[name:string]:SchemaProps}
  required?:string[];
}

type SchemaProps =  IJSObjectProps|IJSArrayProps|JSStringProps|IJSNumberProps|IJSIntegerProps|IJSIntegerProps|IJsonSchemaRef;


interface IJsonSchemaRef extends IJsonSchemaProps{
  $ref:string;
}

interface IJsonSchemaBean extends IJSObjectProps{
  $schema?:string;
  $id?:string;
  title:string;
}


interface ITypeShape {
  // type:"string"|"number"|"object"|"array";
  comment?:string;
  jsonSchema?:SchemaProps;
}

interface IParamShape  extends ITypeShape {
  name:string;
  defaultValue?:any;
}
