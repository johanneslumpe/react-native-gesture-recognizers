'use strict';

import React, { Component, View, PanResponder, NativeModules } from 'react-native';
const { UIManager } = NativeModules;

export default BaseComponent => {
  return class extends Component {

    constructor(props, context) {
      super(props, context);

      this.lastX = 0;
      this.lastY = 0;

      this.state = {
        absoluteChangeX: 0,
        absoluteChangeY: 0,
        changeX: 0,
        changeY: 0,
        decoratedViewWidth: null,
        decoratedViewHeight: null
      };
    }

    componentDidMount() {
      setTimeout(() => {
        UIManager.measure(React.findNodeHandle(this.refs.decorated), (x, y, w, h) => {
          this.setState({
            decoratedViewHeight: h,
            decoratedViewWidth: w
          });
        });
      }, 0);
    }

    componentWillMount() {
      this._panResponder = PanResponder.create({

        onStartShouldSetPanResponder: ({ nativeEvent: { touches } }, { x0, y0 }) => {
          const shouldSet = touches.length === 1;

          if (shouldSet) {
            const { onPanBegin } = this.props;
            onPanBegin && onPanBegin({
              originX: x0,
              originY: y0
            });
          }

          return shouldSet;
        },

        onMoveShouldSetPanResponder: ({ nativeEvent: { touches } }) => {
          return touches.length === 1;
        },

        onPanResponderMove: (evt, { dx, dy }) => {
          const { onPan } = this.props;
          const newState = {
            absoluteChangeX: this.lastX + dx,
            absoluteChangeY: this.lastY + dy,
            changeX: dx,
            changeY: dy
          };

          this.setState(newState);

          onPan && onPan(newState);
        },

        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: this.handlePanResponderRelease,
        onPanResponderRelease: this.handlePanResponderRelease
      });
    }

    handlePanResponderRelease = () => {
      const { onPanEnd } = this.props;
      this.lastX = this.state.absoluteChangeX;
      this.lastY = this.state.absoluteChangeY;
      onPanEnd && onPanEnd();
    }

    render() {
      const {
        onPanBegin,
        onPan,
        onPanEnd,
        panningDecoratorStyle,
        ...props
      } = this.props;

      const state = {
        decoratedViewWidth: width,
        decoratedViewHeight: height,
        ...rest
      } = this.state;

      const style = {
        ...panningDecoratorStyle,
        width,
        height
      };

      return (
        <View {...this._panResponder.panHandlers} style={style}>
          <BaseComponent ref="decorated" {...props} {...rest} />
        </View>
      );
    }
  };
}
