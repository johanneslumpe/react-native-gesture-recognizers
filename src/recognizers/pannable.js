'use strict';

import React, { PropTypes, Component, View, PanResponder } from 'react-native';

const initialState = {
  absoluteChangeX: 0,
  absoluteChangeY: 0,
  changeX: 0,
  changeY: 0
};

const propTypes = {
  onPanBegin: PropTypes.func,
  onPan: PropTypes.func,
  onPanEnd: PropTypes.func,
  resetPan: PropTypes.bool,
  panningDecoratorStyle: PropTypes.object
};

export default ({
  setGestureState = true
} = {}) => BaseComponent => {
  return class extends Component {

    static propTypes = propTypes

    constructor(props, context) {
      super(props, context);

      this.lastX = 0;
      this.lastY = 0;
      this.state = initialState;
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.resetPan) {
        this.lastX = 0;
        this.lastY = 0;

        if (setGestureState) {
          this.setState(initialState);
        }
      }
    }

    componentWillMount() {
      this.panResponder = PanResponder.create({

        onStartShouldSetPanResponder: ({ nativeEvent: { touches } }, { x0, y0 }) => {
          const shouldSet = touches.length === 1;

          if (shouldSet) {
            const { onPanBegin } = this.props;
            onPanBegin && onPanBegin({ // eslint-disable-line no-unused-expressions
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
          const panState = {
            absoluteChangeX: this.lastX + dx,
            absoluteChangeY: this.lastY + dy,
            changeX: dx,
            changeY: dy
          };

          onPan && onPan(panState); // eslint-disable-line no-unused-expressions

          if (setGestureState) {
            this.setState(panState);
          }
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
      onPanEnd && onPanEnd(); // eslint-disable-line no-unused-expressions
    }

    render() {
      const {
        onPanBegin,
        onPan,
        onPanEnd,
        resetPan,
        panningDecoratorStyle,
        ...props
      } = this.props;

      const style = {
        ...panningDecoratorStyle,
        alignSelf: 'flex-start'
      };

      return (
        <View {...this.panResponder.panHandlers} style={style}>
          <BaseComponent {...props} {...this.state} />
        </View>
      );
    }
  };
};
