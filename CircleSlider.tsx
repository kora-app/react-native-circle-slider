import {Dimensions, PanResponder} from 'react-native';
import React, {FC, useCallback, useRef, useState} from 'react';
import Svg, {Circle, G, Path} from 'react-native-svg';
import IcLeaf from './assets/IcLeaf';

interface Props {
  btnRadius?: number;
  dialRadius?: number;
  dialWidth?: number;
  meterColor?: string;
  textColor?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textSize?: number;
  value?: number;
  min?: number;
  max?: number;
  xCenter?: number;
  yCenter?: number;
  onValueChange?: (x: number) => number;
}

const CircleSlider: FC<Props> = ({
    btnRadius = 15,
    dialRadius = 130,
    dialWidth = 5,
    meterColor = '#0cd',
    textColor = '#fff',
    fillColor = 'none',
    strokeColor = '#fff',
    strokeWidth = 0.5,
    textSize = 10,
    value = 0,
    min = 0,
    max = 359,
    xCenter = Dimensions.get('window').width / 2,
    yCenter = Dimensions.get('window').height / 2,
    onValueChange = (x) => x,
}) => {
    const [angle, setAngle] = useState(value);

    const polarToCartesian = useCallback(
        (angle) => {
            const r = dialRadius;
            const hC = dialRadius + btnRadius;
            const a = ((angle - 90) * Math.PI) / 180.0;

            const x = hC + r * Math.cos(a);
            const y = hC + r * Math.sin(a);
            return {x, y};
        },
        [dialRadius, btnRadius],
    );

    const cartesianToPolar = useCallback(
        (x, y) => {
            const hC = dialRadius + btnRadius;

            if (x === 0) {
                return y > hC ? 0 : 180;
            } else if (y === 0) {
                return x > hC ? 90 : 270;
            } else {
                return (
                    Math.round((Math.atan((y - hC) / (x - hC)) * 180) / Math.PI) +
 (x > hC ? 90 : 270)
                );
            }
        },
        [dialRadius, btnRadius],
    );

    const handleValueChange = (value: number) => {
        onValueChange(value);
    };

    const leafWidth = 20;
    const leafHeight = 20;
    const width = (dialRadius + btnRadius) * 2;
    const bR = btnRadius;
    const dR = dialRadius;
    const startCoord = polarToCartesian(0);
    const endCoord = polarToCartesian(angle);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onShouldBlockNativeResponder: (e, gs) => {
                const xOrigin = xCenter - (dialRadius + btnRadius);
                const yOrigin = yCenter - (dialRadius + btnRadius);
                const a = cartesianToPolar(gs.moveX - xOrigin, gs.moveY - yOrigin);
                if (a > 350) {
                    return true;
                }
            },

            onPanResponderMove: (e, gs) => {
                const xOrigin = xCenter - (dialRadius + btnRadius);
                const yOrigin = yCenter - (dialRadius + btnRadius);
                const a = cartesianToPolar(gs.moveX - xOrigin, gs.moveY - yOrigin);

                if (a > 350) {
                    e.preventDefault();
                    e.stopPropagation();
                    panResponder.panHandlers.onResponderTerminationRequest = () => true;
                    panResponder.panHandlers.onResponderTerminate = () => true;
                } else {
                    if (a <= min) {
                        setAngle(min);
                        handleValueChange(min);
                    } else if (a >= max) {
                        setAngle(max);
                        handleValueChange(max);
                    } else {
                        setAngle(a);
                        handleValueChange(a);
                    }
                }

            },
        }),
    ).current;

    return (
        <Svg width={width} height={width}>
            <Circle
                r={dR}
                cx={width / 2}
                cy={width / 2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill={fillColor}
            />

            <Path
                stroke={meterColor}
                strokeWidth={dialWidth}
                fill="none"
                d={`M${startCoord.x} ${startCoord.y} A ${dR} ${dR} 0 ${angle > 180 ? 1 : 0} 1 ${endCoord.x} ${endCoord.y}`}
            />

            <G x={endCoord.x - bR} y={endCoord.y - bR}>
                <Circle
                    r={bR}
                    cx={bR}
                    cy={bR}
                    fill={meterColor}
                    {...panResponder.panHandlers}
                />

                <G>
                    <Circle r={bR} cx={bR} cy={bR} fill="#FFF" {...panResponder.panHandlers} />
                </G>

                <G x={bR - leafWidth / 2} y={bR - leafHeight / 2}>
                    <IcLeaf fill={meterColor} width={leafWidth} height={leafHeight} />
                </G>
            </G>
        </Svg>
    );
};

export default React.memo(CircleSlider);
