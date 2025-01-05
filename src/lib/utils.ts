// export function formatTimeUnit(seconds: number) {
// 	const year = 31556926;
// 	const month = 2628000;
// 	const day = 86400;
// 	const hour = 3600;
// 	const min = 60;

// 	let fmtString = [];
// 	let rem = seconds;

// 	if (seconds < 1) {
// 		return `${Math.floor(seconds * 1000)}ms`;
// 	}

// 	if (rem >= year) {
// 		const yearCalc = Math.floor(rem / year);
// 		fmtString.push(`${Math.floor(yearCalc)} Year(s)`);
// 		rem = seconds % year;

// 		if (yearCalc > 5) {
// 			return fmtString[0];
// 		}
// 	}

// 	if (rem >= month) {
// 		fmtString.push(`${Math.floor(rem / month)} Month(s)`);
// 		rem = rem % month;
// 		if (fmtString.length) {
// 			return fmtString.join(' ');
// 		}
// 	}

// 	if (rem >= day) {
// 		fmtString.push(`${Math.floor(rem / day)} Day(s)`);
// 		rem = rem % day;
// 	}

// 	if (rem >= hour) {
// 		fmtString.push(`${Math.floor(rem / hour)} Hour(s)`);
// 		rem = rem % hour;
// 		if (fmtString.length) {
// 			return fmtString.join(' ');
// 		}
// 	}

// 	if (rem >= min) {
// 		fmtString.push(`${Math.floor(rem / min)} Min(s)`);
// 		rem = rem % min;
// 	}

// 	if (rem >= 1) {
// 		fmtString.push(`${Math.floor(rem)} Second(s)`);
// 	}

// 	return fmtString.join(' ');
// }
