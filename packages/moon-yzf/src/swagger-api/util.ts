import {
  IJSObjectProps,
  IWebApiContext,
  IWebApiDefinded,
  IWebApiGroup,
  SchemaProps
} from "moon-core/declarations/typings/api";
import MoonCore from "moon-core";


export function resSchemaModify(
  schema: SchemaProps,
  apiItem: IWebApiDefinded,
  context: IWebApiContext
): SchemaProps {
  //api外了一层. 所有内容均把data提取出来即可..
  if (!schema) {
    return schema;
  }

  //TODO void怎么表示  ?
  //@ts-ignore;
  if (schema['originalRef'] === 'BaseResponse') {
    return null;
  } else if (schema['$ref']) {
    // console.log('schema[\'$ref\']',schema);
    let subSchema = context.webapiGroup.definitions[
      schema['originalRef']
      ] as IJSObjectProps;

    if (!subSchema) {
      return null;
    }
    // console.log('hema[\'originalRef\']===\'BaseResponse\'',subSchema);
    if (
      subSchema.type === 'object' &&
      subSchema.properties &&
      subSchema.properties.context
    ) {
      if (subSchema.properties.context['$ref']) {
        return context.webapiGroup.definitions[
          subSchema.properties.context['originalRef']
          ];
      } else if (subSchema.properties.context['type'] === 'array') {
        let arrayAschema = subSchema.properties.context;
        arrayAschema.title =
          //@ts-ignore
          subSchema.properties.context.items.originalRef + 'Array';
        return arrayAschema;
      } else {
        return subSchema.properties.context;
      }
    } else {
      return schema;
    }
  } else {
    return schema;
  }
}

export function addDef2List(
  definitions: {
    [defName: string]: SchemaProps;
  },
  schema: SchemaProps | SchemaProps[]
) {
  if (schema instanceof Array) {
    for (let i = 0, iLen = schema.length; i < iLen; i++) {
      let schemaItem = schema[i];

      if (!definitions[schemaItem.title]) {
        definitions[schemaItem.title] = schemaItem;
      }
    }
  } else {
    if (!definitions[schema.title]) {
      definitions[schema.title] = schema;
    }
  }
}

export function findAllRefType(
  definitions: {
    [defName: string]: SchemaProps;
  },
  obj: any,
  refs: string[] = []
): SchemaProps[] {
  if (!obj) {
    return [];
  }

  let refLeng = refs.length;
  traverseObj(obj, refs);

  //TODO 这里要不要把名字改了呢 ?
  let results = [];

  if (obj && !obj.$ref) {
    results.push(obj);
  }

  for (let i = refLeng, ilen = refs.length; i < ilen; i++) {
    let ref = refs[i].replace('#/definitions/', '');

    if (ref && definitions[ref]) {
      results.push(definitions[ref]);
      //遍历对象, 至到找到所有的引用内容为至;
      let jlen = refs.length;
      traverseObj(definitions[ref], refs);
      // console.log('子 traverseObj',refs);
      if (refs.length > jlen) {
        //有新的ref添加进来..

        for (let j = jlen, allen = refs.length; j < allen; j++) {
          results = results.concat(
            findAllRefType(
              definitions,
              definitions[refs[j].replace('#/definitions/', '')],
              refs
            )
          );
        }
      }
    }
  }

  return results;
}

/**
 * 遍历 对象 寻找 ref类型.
 * TODO 会不会有相互引用呢?
 */
function traverseObj(obj: object, refs: string[] = []) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && key === '$ref') {
      if (!refs.includes(obj[key])) {
        refs.push(obj[key]);
      }
    } else if (typeof obj[key] === 'object') {
      traverseObj(obj[key], refs);
    }
  }
  return refs;
}


export interface ITag {
  name: string;
  description: string;
}

export interface IResponseDef {
  description: string;
  schema: SchemaProps;
}

export interface ISwaggerInfo {
  description: string;
  version: string;
  title: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
}

export interface IMethodDefinded {
  tags: string[];
  summary: string;
  operationId: string;
  produces: string[];
  parameters: any[];
  responses: {
    [status: string]: IResponseDef;
  };
  deprecated: boolean;
}

export interface IApiDefinded {
  get?: IMethodDefinded;
  post?: IMethodDefinded;
  [methodType: string]: IMethodDefinded;
}

export interface ISwaggerApisDocs {
  swagger: string;
  host: string;
  basePath: string;
  info: ISwaggerInfo;
  tags: ITag[];
  paths: {
    [apiUrl: string]: IApiDefinded;
  };
  definitions: {
    [defName: string]: SchemaProps;
  };
}
/**
 * 转换项目
 * @param {ISwaggerApisDocs} apiDocs
 * @returns {IWebApiGroup[]}
 */
export function transfer(apiDocs: ISwaggerApisDocs): IWebApiGroup[] {
  //分组;
  let apiGroups: IWebApiGroup[] = [];

  let temp = {};
  let KeyMap = {};
  for (let url in apiDocs.paths) {
    let apiItem = apiDocs.paths[url];

    let groupKey = '';

    //TODO 会不会有两个及三个方法呢 ? 会 account/invoiceProject/{projectId}
    for (let method in apiItem) {
      let apiDefItem: any = {url, method};
      let methodInfo: IMethodDefinded = apiItem[method];

      // let groupKey = url.split('/')[1];
      groupKey = methodInfo.tags[0]; //controller

      if (!KeyMap[groupKey]) {
        KeyMap[groupKey] = {
          name: groupKey,
          apis: [],
          definitions: {}
        };
      }

      temp[url] = {url, methodName: methodInfo.operationId, group: groupKey};

      apiDefItem.name = MoonCore.StringUtil.toLCamelize(methodInfo.operationId)
        .replace(/UsingPOST.*/gi, '')
        .replace(/UsingPUT.*/gi, '')
        .replace(/UsingGET.*/gi, '')
        .replace(/UsingDELETE.*/gi, '_');
      apiDefItem.comment = methodInfo.summary;
      //in  = body header path

      apiDefItem.requestParam = methodInfo.parameters
        .filter(item => item.in != 'header')
        .map(item => {
          if (item.schema) {
            addDef2List(
              KeyMap[groupKey].definitions,
              findAllRefType(apiDocs.definitions, item.schema)
            );
          }

          return {
            name: item.name,
            isInPath: item.in === 'path' ? true : false,
            comment: item.description,
            jsonSchema: item.schema ? item.schema : item
          };
        });
      apiDefItem.responseSchema = methodInfo.responses['200'].schema;
      addDef2List(
        KeyMap[groupKey].definitions,
        findAllRefType(apiDocs.definitions, apiDefItem.responseSchema)
      );
      KeyMap[groupKey].apis.push(apiDefItem);
    }
  }

  for (let key in KeyMap) {
    apiGroups.push(KeyMap[key]);
  }
  return apiGroups;
}