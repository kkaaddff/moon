import * as React from 'react';
import * as T from '../../types';
import './feature-common.less';
import actions from '../../actions/index';
import {connect} from 'react-redux';
import {store2Props} from '../../selectors';
import {Modal, Select, Input} from 'antd';
import {getFeatures} from './dsl';
import {
  generateInteractEle,
  getInterActData,
} from '@/pages/moon/page/components/features/feature-util';
import {getProjectMoonConfig, getMoonContext} from 'kit/moon';

let allFeaures = getFeatures(
  getProjectMoonConfig().type,
  getMoonContext().projectName,
);

interface IState {
  isShow: boolean;
  key?: string;
  feature?: {
    FeatureInfo: {
      code: string;
      name: string;
    };
    InterActData: {
      [name: string]: any;
    };
    apply: (context: any) => void;
  };
  data: any;
}

type IPagingFeatureProps = T.IProps & T.IActionMangerProps;
@connect(store2Props, actions)
export default class FeatureCommon extends React.Component<
  Partial<IPagingFeatureProps>,
  IState
> {
  constructor(props: IPagingFeatureProps) {
    super(props);
    this.state = {
      isShow: false,
      data: {},
    };
  }

  componentWillReceiveProps(nextProps: IPagingFeatureProps) {
    let {actions: {action}, main} = nextProps;
    let feature = null,
      isShow = false,
      key = this.state.key;

    for (let i = 0, iLen = allFeaures.length; i < iLen; i++) {
      let featureItem = allFeaures[i];
      if (featureItem.FeatureInfo.code === main.currentFeature) {
        if (featureItem && featureItem != this.state.feature) {
          feature = featureItem;
        }
        isShow = true;
        key = Math.random();
        break;
      }
    }

    this.setState({feature, isShow, key});
  }

  elems;

  render() {
    let {actions: {action}, main} = this.props;

    if (!this.elems) {
      this.elems = this.getInterEle();
    }
    return (
      <Modal
        title="特性添加"
        visible={this.state.isShow}
        onOk={this.submit}
        onCancel={() => {
          this.setState({data: {}, feature: undefined, isShow: false}, () => {
            this.elems = undefined;
          });
          action.commonChange('main.currentFeature', '');
        }}
      >
        <div key={this.state.key} className="featureCommon">
          {this.elems}
        </div>
      </Modal>
    );
  }

  /**
   * 根据定义获取交互组件;
   */
  getInterEle = () => {
    let feature = this.state.feature;
    if (!feature) return null;

    let elems = [];
    let _InterActData = getInterActData(feature.InterActData, {
      data: this.state.data,
    });
    for (let actData in _InterActData) {
      if (!_InterActData[actData].code) {
        _InterActData[actData].code = actData;
      }
      elems.push(
        generateInteractEle(_InterActData[actData], value => {
          this.setState(
            {
              data: {
                ...this.state.data,
                [actData]: value,
              },
            },
            () => {
              console.log('数据发生变化', this.state.data);
            },
          );
        }),
      );
    }
    return elems;
  };

  clear = () => {
    this.state = {
      isShow: false,
      feature: undefined,
      data: {},
    };
    this.elems = undefined;
  };

  /**
   * 提交相关的特性数据;;
   */
  submit = async () => {
    let {actions, main} = this.props;
    try {
      await this.state.feature.apply({actions, main, data: this.state.data});
      actions.action.commonChange('main.currentFeature', '');
    } catch (err) {
      console.error(err);
    } finally {
      this.clear();
    }
  };
}
