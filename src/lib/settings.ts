// For url lengths 5-8
export const MAXSHORTHASHEXPIRE = 60 * 24 * 30;
export const MINSHORTHASHEXPIRE = 1;

export const MAXSMALLESTHASHEXPIRE = 60 * 24 * 2;

export const MINPRIVATEHASH = 4;
export const MAXPRIVATEHASH = 32;
export const MAXPUBLICHASH = 16;
export const MINPUBLICHASH = 5;
export const MAXCHARS = 150000;
export const MAXLINEITERATIONS = 20000;
export const MAXENCRYPTEDTITLELENGTH = 130;
export const MAXRAWTITLELENGTH = 60;

export const ALLOWEDFORMATS = [
	'raw',
	'C',
	'C++',
	'CQL',
	'CSS',
	'Go',
	'HTML',
	'Java',
	'JavaScript',
	'JSON',
	'JSX',
	'LESS',
	'Liquid',
	'MariaDB SQL',
	'Markdown',
	'MS SQL',
	'MySQL',
	'PHP',
	'PLSQL',
	'PostgreSQL',
	'Python',
	'Rust',
	'Sass',
	'SCSS',
	'SQL',
	'SQLite',
	'TSX',
	'TypeScript',
	'WebAssembly',
	'XML',
	'YAML',
	'APL',
	'PGP',
	'ASN.1',
	'Asterisk',
	'Brainfuck',
	'Cobol',
	'C#',
	'Clojure',
	'ClojureScript',
	'Closure Stylesheets (GSS)',
	'CMake',
	'CoffeeScript',
	'Common Lisp',
	'Cypher',
	'Cython',
	'Crystal',
	'D',
	'Dart',
	'diff',
	'Dockerfile',
	'DTD',
	'Dylan',
	'EBNF',
	'ECL',
	'edn',
	'Eiffel',
	'Elm',
	'Erlang',
	'Esper',
	'Factor',
	'FCL',
	'Forth',
	'Fortran',
	'F#',
	'Gas',
	'Gherkin',
	'Groovy',
	'Haskell',
	'Haxe',
	'HXML',
	'HTTP',
	'IDL',
	'JSON-LD',
	'Jinja2',
	'Julia',
	'Kotlin',
	'LiveScript',
	'Lua',
	'mIRC',
	'Mathematica',
	'Modelica',
	'MUMPS',
	'Mbox',
	'Nginx',
	'NSIS',
	'NTriples',
	'Objective-C',
	'Objective-C++',
	'OCaml',
	'Octave',
	'Oz',
	'Pascal',
	'Perl',
	'Pig',
	'PowerShell',
	'Properties files',
	'ProtoBuf',
	'Pug',
	'Puppet',
	'Q',
	'R',
	'RPM Changes',
	'RPM Spec',
	'Ruby',
	'SAS',
	'Scala',
	'Scheme',
	'Shell',
	'Sieve',
	'Smalltalk',
	'Solr',
	'SML',
	'SPARQL',
	'Spreadsheet',
	'Squirrel',
	'Stylus',
	'Swift',
	'sTeX',
	'LaTeX',
	'SystemVerilog',
	'Tcl',
	'Textile',
	'TiddlyWiki',
	'Tiki wiki',
	'TOML',
	'Troff',
	'TTCN',
	'TTCN_CFG',
	'Turtle',
	'Web IDL',
	'VB.NET',
	'VBScript',
	'Velocity',
	'Verilog',
	'VHDL',
	'XQuery',
	'Yacas',
	'Z80',
	'MscGen',
	'Xù',
	'MsGenny',
	'Vue',
	'Angular Template'
];

export const MAXEXPIRE = 60 * 24 * 30 * 1000;

export default {
	MINPRIVATEHASH,
	MAXPRIVATEHASH,
	MAXPUBLICHASH,
	MINPUBLICHASH,
	MAXCHARS,
	MAXSHORTHASHEXPIRE,
	MINSHORTHASHEXPIRE,
	MAXSMALLESTHASHEXPIRE,
	MAXLINEITERATIONS,
	ALLOWEDFORMATS,
	MAXEXPIRE,
	MAXENCRYPTEDTITLELENGTH,
	MAXRAWTITLELENGTH
};
