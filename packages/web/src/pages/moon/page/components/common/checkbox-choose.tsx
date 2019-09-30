/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/5/30
 **/

import * as React from 'react';
import {connect} from 'react-redux';
import {Checkbox, Row, Col} from 'antd';

interface IActionChooseP {
  onChange: (value: any[]) => void;
  datas: {name: string; value: string}[];
  [name: string]: any;
}

interface IActionChooseS {
  choosedValue:string[];
  [name: string]: any;
}

type IProps = IActionChooseP;
export default class CheckBoxChoose extends React.Component<
  Partial<IProps>,
  IActionChooseS
> {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      choosedValue: [],
    };
  }

  componentDidMount() {
    //默认值 传递出去. 职责不应该这样划分的.
    this.props.onChange(this.state.choosedValue);
  }

  render() {

    return (
      <div>
        <Checkbox.Group
          value={this.state.choosedValue}
          style={{width: '100%'}}
          //@ts-ignore
          onChange={this._checkChange}
        >
          <Row>
            {
              this.props.datas.map(item=><Col key={item.value+item.name} span={8}>
                <Checkbox value={item.value}>{item.name}</Checkbox>
              </Col>)
            }
          </Row>
        </Checkbox.Group>
      </div>
    );
  }

  _checkChange =(choosedValue:string[])=>{
    this.setState({choosedValue});
    this.props.onChange(choosedValue);
  }
}
