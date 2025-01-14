import { ComponentClass } from "react";
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Image, Button } from "@tarojs/components";
import { connect } from "@tarojs/redux";
import { AtIcon } from "taro-ui";
import Api from '@api/'
import Util from '@/util/';

import "./index.less";
import { I<%=className%>Props } from "./types";
import actions from "./action";

 <% pageInfo.subComps.forEach(subComp=>{ %>
import <%=Util.toUCamelize(subComp.fileName)%> from "./components/<%=subComp.fileName%>"; %>
 <% }) %>

@connect(
    ({ <%=instanceName%> }) =>
        ({
            <%=instanceName%>
        } as any),
    actions
)
class <%=className%> extends Component<I<%=className%>Props, any> {
    config: Config = {
        navigationBarTitleText: "<%=pageInfo.title%>"
    };

    componentDidMount() {
        this.props.init();
    }

    componentWillUnmount() {
        this.props.clean();
    }

    render() {
        return (<View className="<%=instanceName%>">
            <View/>
        </View>
    );
    }
}

export default <%=className%> as ComponentClass<any, any>;
