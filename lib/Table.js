class Table {
  constructor(defaultValue) {
    this._rows = [];
    this._cols = [];
    this._data = new Map();
    this._default = defaultValue;
  }

  key(row, col) {
    return JSON.stringify({ row: row, col: col });
  }

  set(row, col, data) {
    this._data.set(this.key(row, col), data);
    this._rows.push(row);
    this._cols.push(col);
  }

  get(row, col) {
    if (this.has(row, col)) {
      return this._data.get(this.key(row, col));
    } else {
      return this._default;
    }
  }

  has(row, col) {
    let key = this.key(row, col);
    return this._data.has(key);
  }

  toCSV() {
    let csv = '???,' + this._cols.join(',') + ";\n"; // Head
    for (let i in this._rows) {
      let row = this._rows[i];
      csv = csv.concat(row);
      for (let j in this._cols) {
        let col = this._cols[j];
        csv = csv.concat(',' + this.get(row, col));
      }
      csv = csv.concat(";\n");
    }
    return csv;
  }
}

module.exports = Table;
