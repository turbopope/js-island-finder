class Table {
  constructor(defaultValue = 0, title = '') {
    this._rows = new Set();
    this._cols = new Set();
    this._data = new Map();
    this._default = defaultValue;
    this._title = title;
  }

  key(row, col) {
    return JSON.stringify({ row: row, col: col });
  }

  set(row, col, data) {
    this._data.set(this.key(row, col), data);
    this._rows.add(row);
    this._cols.add(col);
  }

  setOrAdd(row, col, data) {
    if (this.has(row, col)) {
      let prev = this.get(row, col);
      let now = prev + data;
      this.set(row, col, now);
    } else {
      this.set(row, col, data);
    }
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

  ensureHasRow(row) {
    this._rows.add(row);
  }

  ensureHasCol(col) {
    this._cols.add(col);
  }

  toCSV() {
    let csv = `${this._title},` + Array.from(this._cols).join(',') + "\n"; // Head
    for (let row of this._rows) {
      csv = csv.concat(row);
      for (let col of this._cols.values()) {
        csv = csv.concat(',' + this.get(row, col));
      }
      csv = csv.concat("\n");
    }
    return csv;
  }
}

module.exports = Table;
