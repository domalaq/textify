export default {
	async fetch(request: Request) {
		try {
			const url = new URL(request.url);
			const { pathname, searchParams } = url;

			const base = searchParams.get('base');

			class AttributeRewriter {
				attributeName: string;

				constructor(attributeName: string) {
					this.attributeName = attributeName;
				}
				element(element: Element) {
					const attribute = element.getAttribute(this.attributeName) || '';

					if (this.attributeName === 'href') {
						if (attribute[0] === '/') {
							const symbol = attribute.includes('?') ? '&' : '?';
							console.log(base + attribute + `${symbol}base=${base}`);

							element.setAttribute(this.attributeName, base + attribute + `${symbol}base=${base}`);
						} else {
							element.remove();
						}
					}
				}
			}

			class BaseAdder {
				attributeName: string;

				constructor(attributeName: string) {
					this.attributeName = attributeName;
				}
				element(element: Element) {
					const attribute = element.getAttribute(this.attributeName) || '';

					if (this.attributeName === 'href') {
						if (attribute[0] === '/') {
							const symbol = attribute.includes('?') ? '&' : '?';
							element.setAttribute(this.attributeName, attribute + `${symbol}base=${base}`);
						} else {
							element.remove();
						}
					}
				}
			}

			class MediaRewriter {
				element(element: Element) {
					element.replace('<div style="background:gray;height:100%;width:100%"></div>', {
						html: true,
					});
				}
			}

			class ElementDestroyer {
				element(element: Element) {
					element.remove();
				}
			}

			class MetaInserter {
				element(element: Element) {
					element.append('<meta property="textify" content="domalak">', {
						html: true,
					});
				}
			}

			const rewriter = new HTMLRewriter()
				.on('img', new MediaRewriter())
				.on('link', new AttributeRewriter('href'))
				.on('a', new BaseAdder('href'))
				.on('script', new ElementDestroyer())
				.on('video', new MediaRewriter())
				.on('source', new ElementDestroyer())
				.on('audio', new ElementDestroyer())
				.on('head', new MetaInserter());

			const res = await fetch(base + pathname);
			const contentType = res.headers.get('Content-Type');

			if (contentType?.startsWith('text/html')) {
				return rewriter.transform(res);
			} else {
				return res;
			}
		} catch (error) {
			console.log(error);

			return new Response('Error');
		}
	},
};
