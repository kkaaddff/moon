import * as React from 'react';
import * as T from '../types';
import './top.less';
import _ from 'lodash';
import actions from '../actions/index';
import {connect} from 'react-redux';
import {store2Props} from '../selectors';
import FeatureCommon from './features/feature-common';
import {getFeatures} from './features/dsl';
import ReactJson from 'react-json-view';
import {Modal, Button, Tooltip} from 'antd';
import {getMoonContext, getProjectMoonConfig} from 'kit/moon';

type ITopProps = T.IProps & T.ITopProps;

let allFeaures = getFeatures(
  getProjectMoonConfig().type,
  getMoonContext().projectName,
);

@connect(store2Props, actions)
class Top extends React.Component<ITopProps, T.ITopState> {
  constructor(props: ITopProps) {
    super(props);
    this.state = {isShow: false};
  }

  componentDidMount() {}

  render() {
    let {actions: {action}, main} = this.props;

    return (
      <div className="top">
        <div>
          {allFeaures.map(FeatureDsl =>
            <Tooltip
              placement="bottom"
              title={
                <a href={FeatureDsl.FeatureInfo.descHref} target="_blank">
                  <img
                    style={{
                      width: '500px',
                      maxHeight: '500px',
                      overflow: 'scroll',
                    }}
                    className={'tipImage'}
                    src={FeatureDsl.FeatureInfo.pic}
                  />
                </a>
              }
            >
              <Button
                className={'DSL-feature-btn'}
                key={FeatureDsl.FeatureInfo.code}
                ga-event-category="feature"
                ga-event-action={
                  FeatureDsl.FeatureInfo.code +
                  '[' +
                  FeatureDsl.FeatureInfo.name +
                  ']'
                }
                onClick={action.commonChange.bind(
                  null,
                  'main.currentFeature',
                  FeatureDsl.FeatureInfo.code,
                )}
              >
                {FeatureDsl.FeatureInfo.name}
              </Button>
            </Tooltip>,
          )}

        </div>
        <div>
          <Button
            ga-event-category="功能"
            ga-event-action="保存页面"
            onClick={this._save}
          >
            保存
          </Button>
          <Button
            ga-event-category="功能"
            ga-event-action="生成页面"
            onClick={this._generate}
          >
            生成
          </Button>
        </div>
        <FeatureCommon />
        {this.state.isShow
          ? <Modal
              title="Basic Modal"
              visible={this.state.isShow}
              onOk={this._toggleSho}
              onCancel={this._toggleSho}
            >
              <ReactJson collapsed={true} src={main.pageInfo} />
              <div>
                {JSON.stringify(main.pageInfo)}
              </div>
            </Modal>
          : null}
      </div>
    );
  }

  _toggleSho = () => {};

  _generate = async () => {
    // this._toggleSho();
    let {projectPath, pageInfo} = this.props.main;
    //@ts-ignore
    await window.moon.generate(projectPath, _.cloneDeep(pageInfo));
    alert('生成功!!');
  };

  _save = async () => {
    let {projectPath, pageInfo} = this.props.main;
    //@ts-ignore
    await window.moon.savePageInfo(projectPath, _.cloneDeep(pageInfo));
    alert('成功!!');
  };
}

export default Top as any;
