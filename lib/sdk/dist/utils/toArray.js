"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArray = void 0;
const toArray = ({ value }) => (Array.isArray(value) ? value : value !== undefined ? [value] : undefined);
exports.toArray = toArray;
