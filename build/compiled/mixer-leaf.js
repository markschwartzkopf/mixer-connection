"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixerLeaf = void 0;
class MixerLeaf {
    constructor(definition) {
        this._value = definition.default;
        this.type = definition._type;
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = val;
    }
}
exports.MixerLeaf = MixerLeaf;
