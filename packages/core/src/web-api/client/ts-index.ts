/**
 * @desc
 *
 * 创建controller与入参出参的关联信息;;
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/5/20
 **/
import {Project, InterfaceDeclarationStructure, StructureKind} from 'ts-morph';

import debug from 'debug';
const baseType = ['number', 'string','unknown','boolean'];
const numberReg = /^[0-9]+$/;

let log = debug('web-api:ts-index');
export interface Controller{
  fileName:"",
  methods:{
    [methodName:string]:{
      responseTs:string[];
    }
  }
}


export interface ApiIndex {


}

export function genApiTsIndex({
                                tsConfig,apiDir,apiSuffix}:{
  apiDir:string,
  tsConfig:string,
  apiSuffix:string
}) {

  const project = new Project({
    tsConfigFilePath:tsConfig,
  });
  let result = project.addExistingSourceFiles(apiDir+"**/*.ts");

  let apiTeIndex = {};

  for (
    let fileIndex = 0, fileIndexLen = result.length;
    fileIndex < fileIndexLen;
    fileIndex++
  ) {
    let fileController = result[fileIndex];
    let fileName = fileController.getBaseNameWithoutExtension();

    if(!fileName.endsWith(apiSuffix)) {
      continue;
    }

    apiTeIndex[fileName] = {
      fileName,
      methods: {},
    };
    let allMethods = apiTeIndex[fileName].methods;

    let allInterface = fileController
      .getStructure()
      // @ts-ignore
      .statements.filter(item => item.kind === StructureKind.Interface);
    //获取所有function方法.
    for (
      let i = 0, iLen = fileController.getStructure().statements.length;
      i < iLen;
      i++
    ) {
      let statement = fileController.getStructure().statements[i];

      if (statement.kind === StructureKind.Function) {

        let responseTs = statement.returnType
          ? getAllTsNameRef(
            //@ts-ignore
            allInterface,
            statement.returnType.replace('Promise<', '').replace('>', ''),
          )
          : [];
        allMethods[statement.name] = {
          responseTs,
        };
      }
    }
  }

  return apiTeIndex;
}


/**
 * 获取ts定义的事情 ...
 * 递归遍历所有的ts定义信息;;
 * @param {InterfaceDeclarationStructure[]} interfaces
 * @param {string} name
 * @param {string[]} results
 * @returns {string[]}
 */
function getAllTsNameRef(
  interfaces: InterfaceDeclarationStructure[],
  name: string,
  results: string[] = [],
): string[] {
  if (name.endsWith('[]') && !results.includes(name)) {
    name = name.replace('[]', '');
    if(isRefTs(name) ) {
      results.push(name+"[]");
    }
  }

  for (let i = 0, iLen = interfaces.length; i < iLen; i++) {
    let interfaceItem = interfaces[i];
    if (interfaceItem.name === name) {
      // @ts-ignore
      // console.log(interfaces.properties);
      //遍历获取子依赖..
      results.push(name);
      if (interfaceItem.properties) {
        // @ts-ignore
        for (let j = 0, jLen = interfaceItem.properties.length; j < jLen; j++) {
          // @ts-ignore
          let property = interfaceItem.properties[j];

          let _propertyType = property.type as string;
          if (_propertyType.includes('|')) {
            let allRef = _propertyType.split('|');

            for (let k = 0, kLen = allRef.length; k < kLen; k++) {
              let refElement = allRef[k];
              if (isRefTs(refElement) && !results.includes(refElement)) {
                results = getAllTsNameRef(interfaces, refElement, results);
              }
            }
          } else {
            if (
              isRefTs(_propertyType) &&
              !results.includes(_propertyType)
            ) {
              //TODO 简单的内容直接过滤掉即可.
              results = getAllTsNameRef(
                interfaces,
                _propertyType,
                results,
              );
            }
          }
        }
      }
    }
  }

  if (!results.includes(name) && isRefTs(name)) {
    results.push(name);
  }

  return results;
}

/**
 * 判断是否是引用类型.
 * @param {string} refInfo
 * @returns {boolean}
 */
function isRefTs(refInfo: string): boolean {
  if (baseType.includes(refInfo)) {
    return false;
  } else if (numberReg.test(refInfo.trim())) {
    return false;
  }
  log(`判断是否是引用类型;${numberReg.test('1')} -${refInfo}- VS -${refInfo.trim()}-` ,numberReg.test(refInfo+""), typeof refInfo);
  return true;
}
