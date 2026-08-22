import * as THREE from 'three';
import html2canvas from 'html2canvas';

/**
 * Screen Manager handles rendering the React DOM into the 3D CRT monitor texture
 * and routing raycast / 2D overlay clicks into the synthetic DOM events.
 */

// Canvas-based color resolver (resolves oklch/color-mix/oklab to rgba via browser's 2D canvas engine)
export function resolveColor(colorStr) {
	if (!colorStr) return colorStr;
	try {
		const tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = 1;
		tmpCanvas.height = 1;
		const ctx2d = tmpCanvas.getContext('2d');
		ctx2d.clearRect(0, 0, 1, 1);
		ctx2d.fillStyle = colorStr;
		ctx2d.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx2d.getImageData(0, 0, 1, 1).data;
		if (a === 0) return 'rgba(0,0,0,0)';
		return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
	} catch (e) {
		return 'rgb(10,10,10)';
	}
}

// Balanced-parentheses text patcher: replaces all modern color fns in any CSS text
export function patchCssText(cssText) {
	if (!cssText || typeof cssText !== 'string' || !/oklch|oklab|color-mix|light-dark/i.test(cssText)) return cssText;
	const targets = ['oklch(', 'oklab(', 'color-mix(', 'light-dark('];
	let result = '';
	let i = 0;
	while (i < cssText.length) {
		let matched = null;
		for (const t of targets) {
			if (cssText.substring(i, i + t.length).toLowerCase() === t) {
				matched = t;
				break;
			}
		}
		if (matched) {
			let depth = 1, start = i;
			i += matched.length;
			while (i < cssText.length && depth > 0) {
				if (cssText[i] === '(') depth++;
				else if (cssText[i] === ')') depth--;
				i++;
			}
			result += resolveColor(cssText.substring(start, i));
		} else {
			result += cssText[i++];
		}
	}
	return result;
}

/**
 * Captures the HTML portfolioContent element into a Three.js CanvasTexture
 */
export async function captureScreenTexture(portfolioContent, isMobile = false) {
	if (!portfolioContent) return null;

	const html2canvasOptions = {
		scale: isMobile ? 1.4 : 1.8,
		useCORS: true,
		backgroundColor: '#080808',
		width: 1024,
		height: 768,
		logging: false,
		removeContainer: false,
		foreignObjectRendering: false,
		allowTaint: true,
		imageTimeout: 3000,
		ignoreElements: (element) => {
			return element.tagName === 'VIDEO' ||
				element.tagName === 'IFRAME' ||
				element.classList.contains('skip-capture');
		},
		onclone: (clonedDoc) => {
			// 1. Replace local <link stylesheet> in the clone with patched <style> tag
			Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]')).forEach(link => {
				if (link.href && (link.href.includes('fonts.googleapis.com') || link.href.includes('fonts.gstatic.com'))) {
					return;
				}
				try {
					const sheet = Array.from(document.styleSheets).find(s => s.href === link.href);
					if (sheet && sheet.cssRules) {
						let cssText = '';
						for (let j = 0; j < sheet.cssRules.length; j++) {
							cssText += sheet.cssRules[j].cssText + '\n';
						}
						const style = clonedDoc.createElement('style');
						style.textContent = patchCssText(cssText);
						link.parentNode.replaceChild(style, link);
					}
				} catch (e) {}
			});

			// 2. Patch any inline <style> tags
			Array.from(clonedDoc.querySelectorAll('style')).forEach(s => {
				s.textContent = patchCssText(s.textContent || '');
			});

			// 3. Intercept getComputedStyle in cloned doc
			if (clonedDoc.defaultView && clonedDoc.defaultView.getComputedStyle) {
				const origGetComputedStyle = clonedDoc.defaultView.getComputedStyle.bind(clonedDoc.defaultView);
				clonedDoc.defaultView.getComputedStyle = function(el, pseudo) {
					const style = origGetComputedStyle(el, pseudo);
					return new Proxy(style, {
						get(target, prop) {
							if (prop === 'getPropertyValue') {
								return function(p) {
									const val = target.getPropertyValue(p);
									return patchCssText(val);
								};
							}
							const val = target[prop];
							if (typeof val === 'string') {
								return patchCssText(val);
							}
							if (typeof val === 'function') {
								return function(...args) {
									const res = val.apply(target, args);
									if (typeof res === 'string') return patchCssText(res);
									return res;
								};
							}
							return val;
						}
					});
				};
			}

			// 4. CRUCIAL: Position the cloned portfolioContent at (0, 0) so html2canvas renders it accurately
			const clonedContent = clonedDoc.getElementById('portfolioContent');
			if (clonedContent) {
				clonedContent.style.position = 'absolute';
				clonedContent.style.left = '0';
				clonedContent.style.top = '0';
				clonedContent.style.transform = 'none';
				clonedContent.style.visibility = 'visible';
				clonedContent.style.opacity = '1';

				// 5. Patch computed color properties per element directly on cloned DOM nodes
				const origEls = Array.from(portfolioContent.querySelectorAll('*'));
				const cloneEls = Array.from(clonedContent.querySelectorAll('*'));
				const colorProps = [
					'color', 'backgroundColor',
					'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
					'outlineColor', 'boxShadow', 'textShadow',
				];

				cloneEls.forEach((cloneEl, idx) => {
					const orig = origEls[idx];
					if (!orig) return;
					try {
						const comp = window.getComputedStyle(orig);
						for (const prop of colorProps) {
							const raw = comp[prop];
							if (!raw || raw === 'transparent' || raw === '') continue;
							const resolved = patchCssText(raw);
							if (resolved && resolved !== raw) cloneEl.style[prop] = resolved;
						}
						cloneEl.style.transition = 'none';
						cloneEl.style.animation = 'none';
						cloneEl.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
						cloneEl.style.letterSpacing = '0.02em';
					} catch (e) {}
				});
			}
		}
	};

	const rawCanvas = await html2canvas(portfolioContent, html2canvasOptions);
	if (!rawCanvas) return null;

	// Boost brightness slightly for CRT punch
	const rawCtx = rawCanvas.getContext('2d');
	const imageData = rawCtx.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		data[i] = Math.min(255, data[i] * 1.15);
		data[i + 1] = Math.min(255, data[i + 1] * 1.15);
		data[i + 2] = Math.min(255, data[i + 2] * 1.15);
	}
	rawCtx.putImageData(imageData, 0, 0);

	return rawCanvas;
}
