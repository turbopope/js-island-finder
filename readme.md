# Node Island Finder

Finds Islands of Knowledge in Node Git Repositories.

## Useage

`npm install` once.

To analyze a repo: `./analyze /path/to/repo/ [subpath...]` (the path must be absolute). Optionally pass a whitelist of subpaths in the directory that should be analyzed.


### Keywords

The `keywords` script takes the file `out/npm_keywords` with contents of the form

```JSON
{"rows": [
  {"key": "modulename", "value": ["list", "of", "tags"]},
  {"key": "modulename", "value": ["list", "of", "tags"]}
]}
```

Additional keys may be given and will be ignored. The script counts the number of occurrences of each tags and prints the result as a JSON object to STDOUT in the form

```JSON
{"tag_a": 5, "tag_b": 4, "tag_c": 2}
```

Tags with only one occurrence are omitted. Tags are converted to lowercase. Tags will be printed in descending order, but purely numeric tags are prepended in random order (and I don't know why).
