import { Transform } from 'class-transformer';
import { normalizeStringValue } from '../utils/normalizeStringValue';

export function ToBoolean(): PropertyDecorator {
    return Transform(({ value }) => {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            const normalized = normalizeStringValue(value);
            if (normalized === 'true') {
                return true;
            }

            if (normalized === 'false') {
                return false;
            }
        }

        return undefined;
    });
}
