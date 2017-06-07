import { css } from 'just-curves';
import { _, isDefined, resolve, toCamelCase } from '../utils';
import { propertyAliases, transforms } from './resources';


const transformPropertyComparer = (a: string[], b: string[]) =>
    transforms.indexOf(a[0]) - transforms.indexOf(b[0]);

/**
 * Handles transforming short hand key properties into their native form
 */
const normalizeProperties = (keyframe: Keyframe): void => {
    let cssTransforms: string[][] = [];

    for (let prop in keyframe) {
        const value = keyframe[prop];
        if (!isDefined(value)) {
            keyframe[prop] = _;
            continue;
        }

        // nullify properties so shorthand and handled properties don't end up in the result
        keyframe[prop] = _;

        // get the final property name
        const propAlias = propertyAliases[prop] || prop;

        // find out if the property needs to end up on transform
        const transformIndex = transforms.indexOf(propAlias);

        if (transformIndex !== -1) {
            // handle transforms
            cssTransforms.push([propAlias, value]);
        } else if (propAlias === 'easing') {
            // handle easings
            keyframe.easing = css[toCamelCase(value as string)] || value || css.ease;
        } else {
            // handle others (change background-color and the like to backgroundColor)
            keyframe[toCamelCase(propAlias)] = value;
        }
    }

    if (cssTransforms.length) {
        keyframe.transform = cssTransforms
            .sort(transformPropertyComparer)
            .reduce((c: string, n: string[]) => c + ` ${n[0]}(${n[1]})`, '');
    }
};

/**
 * This calls all keyframe properties that are functions and sets their values
 */
export const resolvePropertiesInKeyframes = (source: ja.CssKeyframeOptions[], target: ja.CssKeyframeOptions[], ctx: ja.AnimationTargetContext<Element>): void => {
    const len = source.length;
    for (let i = 0; i < len; i++) {
        const sourceKeyframe = source[i];
        let targetKeyframe: Keyframe = {};

        for (let propertyName in sourceKeyframe) {
            if (!sourceKeyframe.hasOwnProperty(propertyName)) {
                continue;
            }
            const sourceValue = sourceKeyframe[propertyName];
            if (!isDefined(sourceValue)) {
                continue;
            }
            targetKeyframe[propertyName] = resolve(sourceValue, ctx);
        }

        normalizeProperties(targetKeyframe);
        target.push(targetKeyframe);
    }
};

