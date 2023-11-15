export class MixerLeaf<T extends MixerDefLeaf> {
  private _value: T['default'];
  readonly type: T['_type'];
  constructor(
    readonly definition: T,
    readonly parent: MixerNode,
    readonly address: string[]
  ) {
    this._value = definition.default;
    this.type = definition._type;
  }
  get value() {
    return this._value;
  }
  set value(val: T['default']) {
    this._value = val;
  }
  /* get addresses() {
        return [[...this._address]]
    } */
}
