//      

// Based on https://github.com/addyosmani/timing.js
module.exports = function getTimes() {
	if (typeof window === 'undefined') {
		return {};
	}
	const performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

	if (typeof performance === 'undefined' || !performance.timing) {
		return {};
	}

	const timing = performance.timing;
	const api = {
		firstPaintTime: -1,
		firstPaint: -1,
		loadTime: -1,
		domReadyTime: -1,
		readyStart: -1,
		redirectTime: -1,
		appcacheTime: -1,
		unloadEventTime: -1,
		lookupDomainTime: -1,
		connectTime: -1,
		requestTime: -1,
		initDomTreeTime: -1,
		loadEventTime: -1
	};

	if (timing) {
		// Time to first paint
		if (api.firstPaint < 0) {
			// All times are relative times to the start time within the
			// same objects
			let firstPaint = -1;

			// IE
			if (typeof timing.msFirstPaint === 'number') {
				firstPaint = timing.msFirstPaint;
				api.firstPaintTime = firstPaint - timing.navigationStart;
			} else if (performance.getEntriesByName !== undefined) {
				const firstPaintPerformanceEntry = performance.getEntriesByName('first-paint');
				if (firstPaintPerformanceEntry.length === 1) {
					const firstPaintTime = firstPaintPerformanceEntry[0].startTime;
					firstPaint = performance.timeOrigin + firstPaintTime;
					api.firstPaintTime = firstPaintTime;
				}
			}
			api.firstPaint = firstPaint;
		}

		// Total time from start to load
		api.loadTime = timing.loadEventEnd - timing.fetchStart;
		// Time spent constructing the DOM tree
		api.domReadyTime = timing.domComplete - timing.domInteractive;
		// Time consumed preparing the new page
		api.readyStart = timing.fetchStart - timing.navigationStart;
		// Time spent during redirection
		api.redirectTime = timing.redirectEnd - timing.redirectStart;
		// AppCache
		api.appcacheTime = timing.domainLookupStart - timing.fetchStart;
		// Time spent unloading documents
		api.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
		// DNS query time
		api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
		// TCP connection time
		api.connectTime = timing.connectEnd - timing.connectStart;
		// Time spent during the request
		api.requestTime = timing.responseEnd - timing.requestStart;
		// Request to completion of the DOM loading
		api.initDomTreeTime = timing.domInteractive - timing.responseEnd;
		// Load event time
		api.loadEventTime = timing.loadEventEnd - timing.loadEventStart;
	}

	return api;
};
