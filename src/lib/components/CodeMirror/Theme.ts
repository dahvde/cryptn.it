import { createTheme } from 'thememirror';
import { tags as t } from '@lezer/highlight';

export const baseTheme = createTheme({
	variant: 'dark',
	settings: {
		background: 'hsl(var(--background))',
		foreground: '#ffffff',
		caret: '#fffff',
		selection: '#036dd626',
		lineHighlight: '#ffffff10',
		gutterBackground: '#00000010',
		gutterForeground: 'rgb(var(--background-600))'
	},
	styles: []
});

// export const myTheme = createTheme({
// 	variant: 'dark',
// 	settings: {
// 		background: '#0f0d0b',
// 		foreground: '#92867c',
// 		caret: '#9b6431',
// 		selection: '#036dd626',
// 		lineHighlight: '#8a91991a',
// 		gutterBackground: '#0f0d0b',
// 		gutterForeground: '#78665e'
// 	},
// 	styles: [
// 		{
// 			tag: t.comment,
// 			color: '#4b3b2a'
// 		},
// 		{
// 			tag: t.variableName,
// 			color: '#78563b'
// 		},
// 		{
// 			tag: [t.string, t.special(t.brace)],
// 			color: '#807928'
// 		},
// 		{
// 			tag: t.number,
// 			color: '#5c6166'
// 		},
// 		{
// 			tag: t.bool,
// 			color: '#594270'
// 		},
// 		{
// 			tag: t.null,
// 			color: '#45620e'
// 		},
// 		{
// 			tag: t.keyword,
// 			color: '#2c5863'
// 		},
// 		{
// 			tag: t.operator,
// 			color: '#7a745c'
// 		},
// 		{
// 			tag: t.className,
// 			color: '#5c6166'
// 		},
// 		{
// 			tag: t.definition(t.typeName),
// 			color: '#78563b'
// 		},
// 		{
// 			tag: t.typeName,
// 			color: '#5c6166'
// 		},
// 		{
// 			tag: t.angleBracket,
// 			color: '#5c6166'
// 		},
// 		{
// 			tag: t.tagName,
// 			color: '#4e6039'
// 		},
// 		{
// 			tag: t.attributeName,
// 			color: '#2a4551'
// 		}
// 	]
// });

export const myTheme = createTheme({
	variant: 'dark',
	settings: {
		background: 'hsl(var(--background))',
		foreground: '#8f8870',
		caret: '#fffff',
		selection: '#036dd626',
		lineHighlight: '#ffffff10',
		gutterBackground: '#00000010',
		gutterForeground: 'rgb(var(--background-600))'
	},
	styles: [
		{
			tag: t.comment,
			color: '#454130'
		},
		{
			tag: t.variableName,
			color: '#5c7e43'
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#a04121'
		},
		{
			tag: t.number,
			color: '#8c8835'
		},
		{
			tag: t.bool,
			color: '#5c6166'
		},
		{
			tag: t.null,
			color: '#7c863c'
		},
		{
			tag: t.keyword,
			color: '#346c8d'
		},
		{
			tag: t.operator,
			color: '#4b7674'
		},
		{
			tag: t.className,
			color: '#5e4e74'
		},
		{
			tag: t.definition(t.typeName),
			color: '#46626a'
		},
		{
			tag: t.typeName,
			color: '#2f5293'
		},
		{
			tag: t.angleBracket,
			color: '#65625c'
		},
		{
			tag: t.tagName,
			color: '#84743e'
		},
		{
			tag: t.attributeName,
			color: '#5b7849'
		}
	]
});
