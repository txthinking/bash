function R(e,t){if(t&&t.documentElement)e=t,t=arguments[2];else if(!e||!e.documentElement)throw new Error("First argument to R constructor should be a document object.");if(t=t||{},this._doc=e,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._debug=!!t.debug,this._maxElemsToParse=t.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE,this._nbTopCandidates=t.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES,this._charThreshold=t.charThreshold||this.DEFAULT_CHAR_THRESHOLD,this._classesToPreserve=this.CLASSES_TO_PRESERVE.concat(t.classesToPreserve||[]),this._keepClasses=!!t.keepClasses,this._serializer=t.serializer||function(e){return e.innerHTML},this._disableJSONLD=!!t.disableJSONLD,this._allowedVideoRegex=t.allowedVideoRegex||this.REGEXPS.videos,this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY,this._debug){let e=function(e){if(e.nodeType==e.TEXT_NODE)return`${e.nodeName} ("${e.textContent}")`;let t=Array.from(e.attributes||[],function(e){return`${e.name}="${e.value}"`}).join(" ");return`<${e.localName} ${t}>`};this.log=function(){if(typeof console!="undefined"){let t=Array.from(arguments,t=>t&&t.nodeType==this.ELEMENT_NODE?e(t):t);t.unshift("Reader: (R)"),console.log.apply(console,t)}else if(typeof dump!="undefined"){var t=Array.prototype.map.call(arguments,function(t){return t&&t.nodeName?e(t):t}).join(" ");dump("Reader: (R) "+t+`
`)}}}else this.log=function(){}}R.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,ELEMENT_NODE:1,TEXT_NODE:3,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_TAGS_TO_SCORE:"section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),DEFAULT_CHAR_THRESHOLD:500,REGEXPS:{unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i,positive:/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,negative:/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,extraneous:/print|archive|comment|discuss|e[-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby|p-author/i,replaceFonts:/<(\/?)font[^>]*>/gi,normalize:/\s{2,}/g,videos:/\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,shareElements:/(\b|_)(share|sharedaddy)(\b|_)/i,nextLink:/(next|weiter|continue|>([^|]|$)|»([^|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,tokenize:/\W+/g,whitespace:/^\s*$/,hasContent:/\S$/,hashUrl:/^#.+/,srcsetUrl:/(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,b64DataUrl:/^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,jsonLdArticleTypes:/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/},UNLIKELY_ROLES:["menu","menubar","complementary","navigation","alert","alertdialog","dialog"],DIV_TO_P_ELEMS:new Set(["BLOCKQUOTE","DL","DIV","IMG","OL","P","PRE","TABLE","UL"]),ALTER_TO_DIV_EXCEPTIONS:["DIV","ARTICLE","SECTION","P"],PRESENTATIONAL_ATTRIBUTES:["align","background","bgcolor","border","cellpadding","cellspacing","frame","hspace","rules","style","valign","vspace"],DEPRECATED_SIZE_ATTRIBUTE_ELEMS:["TABLE","TH","TD","HR","PRE"],PHRASING_ELEMS:["ABBR","AUDIO","B","BDO","BR","BUTTON","CITE","CODE","DATA","DATALIST","DFN","EM","EMBED","I","IMG","INPUT","KBD","LABEL","MARK","MATH","METER","NOSCRIPT","OBJECT","OUTPUT","PROGRESS","Q","RUBY","SAMP","SCRIPT","SELECT","SMALL","SPAN","STRONG","SUB","SUP","TEXTAREA","TIME","VAR","WBR"],CLASSES_TO_PRESERVE:["page"],HTML_ESCAPE_MAP:{lt:"<",gt:">",amp:"&",quot:'"',apos:"'"},_postProcessContent:function(e){this._fixRelativeUris(e),this._simplifyNestedElements(e),this._keepClasses||this._cleanClasses(e)},_removeNodes:function(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _removeNodes");for(var s,o,n=e.length-1;n>=0;n--)s=e[n],o=s.parentNode,o&&(!t||t.call(this,s,n,e))&&o.removeChild(s)},_replaceNodeTags:function(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _replaceNodeTags");for(const n of e)this._setNodeTag(n,t)},_forEachNode:function(e,t){Array.prototype.forEach.call(e,t,this)},_findNode:function(e,t){return Array.prototype.find.call(e,t,this)},_someNode:function(e,t){return Array.prototype.some.call(e,t,this)},_everyNode:function(e,t){return Array.prototype.every.call(e,t,this)},_concatNodeLists:function(){var e=Array.prototype.slice,t=e.call(arguments),n=t.map(function(t){return e.call(t)});return Array.prototype.concat.apply([],n)},_getAllNodesWithTag:function(e,t){return e.querySelectorAll?e.querySelectorAll(t.join(",")):[].concat.apply([],t.map(function(t){var n=e.getElementsByTagName(t);return Array.isArray(n)?n:Array.from(n)}))},_cleanClasses:function(e){var n=this._classesToPreserve,t=(e.getAttribute("class")||"").split(/\s+/).filter(function(e){return n.indexOf(e)!=-1}).join(" ");t?e.setAttribute("class",t):e.removeAttribute("class");for(e=e.firstElementChild;e;e=e.nextElementSibling)this._cleanClasses(e)},_fixRelativeUris:function(e){var s,o,n=this._doc.baseURI,i=this._doc.documentURI;function t(e){if(n==i&&e.charAt(0)=="#")return e;try{return new URL(e,n).href}catch{}return e}s=this._getAllNodesWithTag(e,["a"]),this._forEachNode(s,function(e){var s,o,n=e.getAttribute("href");if(n)if(n.indexOf("javascript:")===0)if(e.childNodes.length===1&&e.childNodes[0].nodeType===this.TEXT_NODE)o=this._doc.createTextNode(e.textContent),e.parentNode.replaceChild(o,e);else{for(s=this._doc.createElement("span");e.firstChild;)s.appendChild(e.firstChild);e.parentNode.replaceChild(s,e)}else e.setAttribute("href",t(n))}),o=this._getAllNodesWithTag(e,["img","picture","figure","video","audio","source"]),this._forEachNode(o,function(e){var i,n=e.getAttribute("src"),s=e.getAttribute("poster"),o=e.getAttribute("srcset");n&&e.setAttribute("src",t(n)),s&&e.setAttribute("poster",t(s)),o&&(i=o.replace(this.REGEXPS.srcsetUrl,function(e,n,s,o){return t(n)+(s||"")+o}),e.setAttribute("srcset",i))})},_simplifyNestedElements:function(e){for(var n,s,t=e;t;){if(t.parentNode&&["DIV","SECTION"].includes(t.tagName)&&!(t.id&&t.id.startsWith("readability"))){if(this._isElementWithoutContent(t)){t=this._removeAndGetNext(t);continue}if(this._hasSingleTagInsideElement(t,"DIV")||this._hasSingleTagInsideElement(t,"SECTION")){for(s=t.children[0],n=0;n<t.attributes.length;n++)s.setAttribute(t.attributes[n].name,t.attributes[n].value);t.parentNode.replaceChild(s,t),t=s;continue}}t=this._getNextNode(t)}},_getArticleTitle:function(){var o,i,a,r,c,l,n=this._doc,e="",t="";try{e=t=n.title.trim(),typeof e!="string"&&(e=t=this._getInnerText(n.getElementsByTagName("title")[0]))}catch{}o=!1;function s(e){return e.split(/\s+/).length}return/ [|\-\\/>»] /.test(e)?(o=/ [\\/>»] /.test(e),e=t.replace(/(.*)[|\-\\/>»] .*/gi,"$1"),s(e)<3&&(e=t.replace(/[^|\-\\/>»]*[|\-\\/>»](.*)/gi,"$1"))):e.indexOf(": ")!==-1?(r=this._concatNodeLists(n.getElementsByTagName("h1"),n.getElementsByTagName("h2")),c=e.trim(),l=this._someNode(r,function(e){return e.textContent.trim()===c}),l||(e=t.substring(t.lastIndexOf(":")+1),s(e)<3?e=t.substring(t.indexOf(":")+1):s(t.substr(0,t.indexOf(":")))>5&&(e=t))):(e.length>150||e.length<15)&&(i=n.getElementsByTagName("h1"),i.length===1&&(e=this._getInnerText(i[0]))),e=e.trim().replace(this.REGEXPS.normalize," "),a=s(e),a<=4&&(!o||a!=s(t.replace(/[|\-\\/>»]+/g,""))-1)&&(e=t),e},_prepDocument:function(){var e=this._doc;this._removeNodes(this._getAllNodesWithTag(e,["style"])),e.body&&this._replaceBrs(e.body),this._replaceNodeTags(this._getAllNodesWithTag(e,["font"]),"SPAN")},_nextNode:function(e){for(var t=e;t&&t.nodeType!=this.ELEMENT_NODE&&this.REGEXPS.whitespace.test(t.textContent);)t=t.nextSibling;return t},_replaceBrs:function(e){this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(e){for(var n,s,i,a,t=e.nextSibling,o=!1;(t=this._nextNode(t))&&t.tagName=="BR";)o=!0,i=t.nextSibling,t.parentNode.removeChild(t),t=i;if(o){for(n=this._doc.createElement("p"),e.parentNode.replaceChild(n,e),t=n.nextSibling;t;){if(t.tagName=="BR"&&(s=this._nextNode(t.nextSibling),s&&s.tagName=="BR"))break;if(!this._isPhrasingContent(t))break;a=t.nextSibling,n.appendChild(t),t=a}for(;n.lastChild&&this._isWhitespace(n.lastChild);)n.removeChild(n.lastChild);n.parentNode.tagName==="P"&&this._setNodeTag(n.parentNode,"DIV")}})},_setNodeTag:function(e,t){if(this.log("_setNodeTag",e,t),this._docJSDOMParser)return e.localName=t.toLowerCase(),e.tagName=t.toUpperCase(),e;for(var s,n=e.ownerDocument.createElement(t);e.firstChild;)n.appendChild(e.firstChild);e.parentNode.replaceChild(n,e),e.readability&&(n.readability=e.readability);for(s=0;s<e.attributes.length;s++)try{n.setAttribute(e.attributes[s].name,e.attributes[s].value)}catch{}return n},_prepArticle:function(e){this._cleanStyles(e),this._markDataTables(e),this._fixLazyImages(e),this._cleanConditionally(e,"form"),this._cleanConditionally(e,"fieldset"),this._clean(e,"object"),this._clean(e,"embed"),this._clean(e,"footer"),this._clean(e,"link"),this._clean(e,"aside");var t=this.DEFAULT_CHAR_THRESHOLD;this._forEachNode(e.children,function(e){this._cleanMatchedNodes(e,function(e,n){return this.REGEXPS.shareElements.test(n)&&e.textContent.length<t})}),this._clean(e,"iframe"),this._clean(e,"input"),this._clean(e,"textarea"),this._clean(e,"select"),this._clean(e,"button"),this._cleanHeaders(e),this._cleanConditionally(e,"table"),this._cleanConditionally(e,"ul"),this._cleanConditionally(e,"div"),this._replaceNodeTags(this._getAllNodesWithTag(e,["h1"]),"h2"),this._removeNodes(this._getAllNodesWithTag(e,["p"]),function(e){var t=e.getElementsByTagName("img").length,n=e.getElementsByTagName("embed").length,s=e.getElementsByTagName("object").length,o=e.getElementsByTagName("iframe").length,i=t+n+s+o;return i===0&&!this._getInnerText(e,!1)}),this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(e){var t=this._nextNode(e.nextSibling);t&&t.tagName=="P"&&e.parentNode.removeChild(e)}),this._forEachNode(this._getAllNodesWithTag(e,["table"]),function(e){var t,n,s=this._hasSingleTagInsideElement(e,"TBODY")?e.firstElementChild:e;this._hasSingleTagInsideElement(s,"TR")&&(n=s.firstElementChild,this._hasSingleTagInsideElement(n,"TD")&&(t=n.firstElementChild,t=this._setNodeTag(t,this._everyNode(t.childNodes,this._isPhrasingContent)?"P":"DIV"),e.parentNode.replaceChild(t,e)))})},_initializeNode:function(e){switch(e.readability={contentScore:0},e.tagName){case"DIV":e.readability.contentScore+=5;break;case"PRE":case"TD":case"BLOCKQUOTE":e.readability.contentScore+=3;break;case"ADDRESS":case"OL":case"UL":case"DL":case"DD":case"DT":case"LI":case"FORM":e.readability.contentScore-=3;break;case"H1":case"H2":case"H3":case"H4":case"H5":case"H6":case"TH":e.readability.contentScore-=5;break}e.readability.contentScore+=this._getClassWeight(e)},_removeAndGetNext:function(e){var t=this._getNextNode(e,!0);return e.parentNode.removeChild(e),t},_getNextNode:function(e,t){if(!t&&e.firstElementChild)return e.firstElementChild;if(e.nextElementSibling)return e.nextElementSibling;do e=e.parentNode;while(e&&!e.nextElementSibling)return e&&e.nextElementSibling},_textSimilarity:function(e,t){var o,i,s=e.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean),n=t.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);return!s.length||!n.length?0:(o=n.filter(e=>!s.includes(e)),i=o.join(" ").length/n.join(" ").length,1-i)},_checkByline:function(e,t){if(this._articleByline)return!1;if(e.getAttribute!==void 0)var s=e.getAttribute("rel"),n=e.getAttribute("itemprop");return!(!(s==="author"||n&&n.indexOf("author")!==-1||this.REGEXPS.byline.test(t))||!this._isValidByline(e.textContent))&&(this._articleByline=e.textContent.trim(),!0)},_getNodeAncestors:function(e,t){t=t||0;for(var s=0,n=[];e.parentNode;){if(n.push(e.parentNode),t&&++s===t)break;e=e.parentNode}return n},_grabArticle:function(e){if(this.log("**** grabArticle ****"),f=this._doc,$=e!==null,e=e||this._doc.body,!e)return this.log("No body found in document. Abort."),null;for(P=e.innerHTML;!0;){this.log("Starting grabArticle loop"),H=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS),v=[],t=this._doc.documentElement;let K=!0;for(;t;){if(t.tagName==="HTML"&&(this._articleLang=t.getAttribute("lang")),l=t.className+" "+t.id,!this._isProbablyVisible(t)){this.log("Removing hidden node - "+l),t=this._removeAndGetNext(t);continue}if(t.getAttribute("aria-modal")=="true"&&t.getAttribute("role")=="dialog"){t=this._removeAndGetNext(t);continue}if(this._checkByline(t,l)){t=this._removeAndGetNext(t);continue}if(K&&this._headerDuplicatesTitle(t)){this.log("Removing header: ",t.textContent.trim(),this._articleTitle.trim()),K=!1,t=this._removeAndGetNext(t);continue}if(H){if(this.REGEXPS.unlikelyCandidates.test(l)&&!this.REGEXPS.okMaybeItsACandidate.test(l)&&!this._hasAncestorTag(t,"table")&&!this._hasAncestorTag(t,"code")&&t.tagName!=="BODY"&&t.tagName!=="A"){this.log("Removing unlikely candidate - "+l),t=this._removeAndGetNext(t);continue}if(this.UNLIKELY_ROLES.includes(t.getAttribute("role"))){this.log("Removing content with role "+t.getAttribute("role")+" - "+l),t=this._removeAndGetNext(t);continue}}if((t.tagName==="DIV"||t.tagName==="SECTION"||t.tagName==="HEADER"||t.tagName==="H1"||t.tagName==="H2"||t.tagName==="H3"||t.tagName==="H4"||t.tagName==="H5"||t.tagName==="H6")&&this._isElementWithoutContent(t)){t=this._removeAndGetNext(t);continue}if(this.DEFAULT_TAGS_TO_SCORE.indexOf(t.tagName)!==-1&&v.push(t),t.tagName==="DIV"){for(a=null,c=t.firstChild;c;){if(I=c.nextSibling,this._isPhrasingContent(c))a!==null?a.appendChild(c):this._isWhitespace(c)||(a=f.createElement("p"),t.replaceChild(a,c),a.appendChild(c));else if(a!==null){for(;a.lastChild&&this._isWhitespace(a.lastChild);)a.removeChild(a.lastChild);a=null}c=I}this._hasSingleTagInsideElement(t,"P")&&this._getLinkDensity(t)<.25?(T=t.children[0],t.parentNode.replaceChild(T,t),t=T,v.push(t)):this._hasChildBlockElement(t)||(t=this._setNodeTag(t,"P"),v.push(t))}t=this._getNextNode(t)}O=[],this._forEachNode(v,function(e){if(!e.parentNode||typeof e.parentNode.tagName=="undefined")return;var t,s,n=this._getInnerText(e);if(n.length<25)return;if(s=this._getNodeAncestors(e,5),s.length===0)return;t=0,t+=1,t+=n.split(",").length,t+=Math.min(Math.floor(n.length/100),3),this._forEachNode(s,function(e,n){if(!e.tagName||!e.parentNode||typeof e.parentNode.tagName=="undefined")return;if(typeof e.readability=="undefined"&&(this._initializeNode(e),O.push(e)),n===0)var s=1;else n===1?s=2:s=n*3;e.readability.contentScore+=t/s})});for(var t,n,s,o,i,a,c,l,d,u,h,m,f,p,g,v,b,j,y,_,w,O,x,C,E,k,A,S,F,T,z,D,N,L,R,P,H,I,B,V,$,W,r=[],M=0,U=O.length;M<U;M+=1){h=O[M],y=h.readability.contentScore*(1-this._getLinkDensity(h)),h.readability.contentScore=y,this.log("Candidate:",h,"with score "+y);for(b=0;b<this._nbTopCandidates;b++)if(F=r[b],!F||y>F.readability.contentScore){r.splice(b,0,h),r.length>this._nbTopCandidates&&r.pop();break}}if(n=r[0]||null,D=!1,n===null||n.tagName==="BODY"){for(n=f.createElement("DIV"),D=!0;e.firstChild;)this.log("Moving child out:",e.firstChild),n.appendChild(e.firstChild);e.appendChild(n),this._initializeNode(n)}else if(n){for(g=[],p=1;p<r.length;p++)r[p].readability.contentScore/n.readability.contentScore>=.75&&g.push(this._getNodeAncestors(r[p]));if(C=3,g.length>=C)for(s=n.parentNode;s.tagName!=="BODY";){for(E=0,k=0;k<g.length&&E<C;k++)E+=Number(g[k].includes(s));if(E>=C){n=s;break}s=s.parentNode}for(n.readability||this._initializeNode(n),s=n.parentNode,A=n.readability.contentScore,V=A/3;s.tagName!=="BODY";){if(!s.readability){s=s.parentNode;continue}if(R=s.readability.contentScore,R<V)break;if(R>A){n=s;break}A=s.readability.contentScore,s=s.parentNode}for(s=n.parentNode;s.tagName!="BODY"&&s.children.length==1;)n=s,s=n.parentNode;n.readability||this._initializeNode(n)}i=f.createElement("DIV"),$&&(i.id="readability-content");for(B=Math.max(10,n.readability.contentScore*.2),s=n.parentNode,w=s.children,m=0,N=w.length;m<N;m++)o=w[m],u=!1,this.log("Looking at sibling node:",o,o.readability?"with score "+o.readability.contentScore:""),this.log("Sibling has score",o.readability?o.readability.contentScore:"Unknown"),o===n?u=!0:(S=0,o.className===n.className&&n.className!==""&&(S+=n.readability.contentScore*.2),o.readability&&o.readability.contentScore+S>=B?u=!0:o.nodeName==="P"&&(L=this._getLinkDensity(o),z=this._getInnerText(o),_=z.length,_>80&&L<.25?u=!0:_<80&&_>0&&L===0&&z.search(/\.( |$)/)!==-1&&(u=!0))),u&&(this.log("Appending node:",o),this.ALTER_TO_DIV_EXCEPTIONS.indexOf(o.nodeName)===-1&&(this.log("Altering sibling:",o,"to div."),o=this._setNodeTag(o,"DIV")),i.appendChild(o),w=s.children,m-=1,N-=1);if(this._debug&&this.log("Article content pre-prep: "+i.innerHTML),this._prepArticle(i),this._debug&&this.log("Article content post-prep: "+i.innerHTML),D)n.id="readability-page-1",n.className="page";else{for(j=f.createElement("DIV"),j.id="readability-page-1",j.className="page";i.firstChild;)j.appendChild(i.firstChild);i.appendChild(j)}if(this._debug&&this.log("Article content after paging: "+i.innerHTML),x=!0,d=this._getInnerText(i,!0).length,d<this._charThreshold)if(x=!1,e.innerHTML=P,this._flagIsActive(this.FLAG_STRIP_UNLIKELYS))this._removeFlag(this.FLAG_STRIP_UNLIKELYS),this._attempts.push({articleContent:i,textLength:d});else if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES))this._removeFlag(this.FLAG_WEIGHT_CLASSES),this._attempts.push({articleContent:i,textLength:d});else if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY),this._attempts.push({articleContent:i,textLength:d});else{if(this._attempts.push({articleContent:i,textLength:d}),this._attempts.sort(function(e,t){return t.textLength-e.textLength}),!this._attempts[0].textLength)return null;i=this._attempts[0].articleContent,x=!0}if(x)return W=[s,n].concat(this._getNodeAncestors(s)),this._someNode(W,function(e){if(!e.tagName)return!1;var t=e.getAttribute("dir");return!!t&&(this._articleDir=t,!0)}),i}},_isValidByline:function(e){return(typeof e=="string"||e instanceof String)&&(e=e.trim(),e.length>0&&e.length<100)},_unescapeHtmlEntities:function(e){if(!e)return e;var t=this.HTML_ESCAPE_MAP;return e.replace(/&(quot|amp|apos|lt|gt);/g,function(e,n){return t[n]}).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi,function(e,t,n){var s=parseInt(t||n,t?16:10);return String.fromCharCode(s)})},_getJSONLD:function(e){var t,n=this._getAllNodesWithTag(e,["script"]);return this._forEachNode(n,function(e){if(!t&&e.getAttribute("type")==="application/ld+json")try{var s,o,i,a=e.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g,""),n=JSON.parse(a);if(!n["@context"]||!n["@context"].match(/^https?:\/\/schema\.org$/))return;if(!n["@type"]&&Array.isArray(n["@graph"])&&(n=n["@graph"].find(function(e){return(e["@type"]||"").match(this.REGEXPS.jsonLdArticleTypes)})),!n||!n["@type"]||!n["@type"].match(this.REGEXPS.jsonLdArticleTypes))return;t={},typeof n.name=="string"&&typeof n.headline=="string"&&n.name!==n.headline?(s=this._getArticleTitle(),o=this._textSimilarity(n.name,s)>.75,i=this._textSimilarity(n.headline,s)>.75,i&&!o?t.title=n.headline:t.title=n.name):typeof n.name=="string"?t.title=n.name.trim():typeof n.headline=="string"&&(t.title=n.headline.trim()),n.author&&(typeof n.author.name=="string"?t.byline=n.author.name.trim():Array.isArray(n.author)&&n.author[0]&&typeof n.author[0].name=="string"&&(t.byline=n.author.filter(function(e){return e&&typeof e.name=="string"}).map(function(e){return e.name.trim()}).join(", "))),typeof n.description=="string"&&(t.excerpt=n.description.trim()),n.publisher&&typeof n.publisher.name=="string"&&(t.siteName=n.publisher.name.trim());return}catch(e){this.log(e.message)}}),t||{}},_getArticleMetadata:function(e){var n={},t={},s=this._doc.getElementsByTagName("meta"),o=/\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title|site_name)\s*/gi,i=/^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[.:]\s*)?(author|creator|description|title|site_name)\s*$/i;return this._forEachNode(s,function(e){var n,s,r=e.getAttribute("name"),c=e.getAttribute("property"),a=e.getAttribute("content");if(!a)return;s=null,n=null,c&&(s=c.match(o),s&&(n=s[0].toLowerCase().replace(/\s/g,""),t[n]=a.trim())),!s&&r&&i.test(r)&&(n=r,a&&(n=n.toLowerCase().replace(/\s/g,"").replace(/\./g,":"),t[n]=a.trim()))}),n.title=e.title||t["dc:title"]||t["dcterm:title"]||t["og:title"]||t["weibo:article:title"]||t["weibo:webpage:title"]||t.title||t["twitter:title"],n.title||(n.title=this._getArticleTitle()),n.byline=e.byline||t["dc:creator"]||t["dcterm:creator"]||t.author,n.excerpt=e.excerpt||t["dc:description"]||t["dcterm:description"]||t["og:description"]||t["weibo:article:description"]||t["weibo:webpage:description"]||t.description||t["twitter:description"],n.siteName=e.siteName||t["og:site_name"],n.title=this._unescapeHtmlEntities(n.title),n.byline=this._unescapeHtmlEntities(n.byline),n.excerpt=this._unescapeHtmlEntities(n.excerpt),n.siteName=this._unescapeHtmlEntities(n.siteName),n},_isSingleImage:function(e){return e.tagName==="IMG"||e.children.length===1&&e.textContent.trim()===""&&this._isSingleImage(e.children[0])},_unwrapNoscriptImages:function(e){var t,n=Array.from(e.getElementsByTagName("img"));this._forEachNode(n,function(e){for(var n,t=0;t<e.attributes.length;t++){switch(n=e.attributes[t],n.name){case"src":case"srcset":case"data-src":case"data-srcset":return}if(/\.(jpg|jpeg|png|webp)/i.test(n.value))return}e.parentNode.removeChild(e)}),t=Array.from(e.getElementsByTagName("noscript")),this._forEachNode(t,function(t){var n,s,o,i,r,c,a=e.createElement("div");if(a.innerHTML=t.innerHTML,!this._isSingleImage(a))return;if(s=t.previousElementSibling,s&&this._isSingleImage(s)){o=s,o.tagName!=="IMG"&&(o=s.getElementsByTagName("img")[0]);for(r=a.getElementsByTagName("img")[0],c=0;c<o.attributes.length;c++){if(n=o.attributes[c],n.value==="")continue;if(n.name==="src"||n.name==="srcset"||/\.(jpg|jpeg|png|webp)/i.test(n.value)){if(r.getAttribute(n.name)===n.value)continue;i=n.name,r.hasAttribute(i)&&(i="data-old-"+i),r.setAttribute(i,n.value)}}t.parentNode.replaceChild(a.firstElementChild,s)}})},_removeScripts:function(e){this._removeNodes(this._getAllNodesWithTag(e,["script","noscript"]))},_hasSingleTagInsideElement:function(e,t){return e.children.length==1&&e.children[0].tagName===t&&!this._someNode(e.childNodes,function(e){return e.nodeType===this.TEXT_NODE&&this.REGEXPS.hasContent.test(e.textContent)})},_isElementWithoutContent:function(e){return e.nodeType===this.ELEMENT_NODE&&e.textContent.trim().length==0&&(e.children.length==0||e.children.length==e.getElementsByTagName("br").length+e.getElementsByTagName("hr").length)},_hasChildBlockElement:function(e){return this._someNode(e.childNodes,function(e){return this.DIV_TO_P_ELEMS.has(e.tagName)||this._hasChildBlockElement(e)})},_isPhrasingContent:function(e){return e.nodeType===this.TEXT_NODE||this.PHRASING_ELEMS.indexOf(e.tagName)!==-1||(e.tagName==="A"||e.tagName==="DEL"||e.tagName==="INS")&&this._everyNode(e.childNodes,this._isPhrasingContent)},_isWhitespace:function(e){return e.nodeType===this.TEXT_NODE&&e.textContent.trim().length===0||e.nodeType===this.ELEMENT_NODE&&e.tagName==="BR"},_getInnerText:function(e,t){t=typeof t=="undefined"||t;var n=e.textContent.trim();return t?n.replace(this.REGEXPS.normalize," "):n},_getCharCount:function(e,t){return t=t||",",this._getInnerText(e).split(t).length-1},_cleanStyles:function(e){if(!e||e.tagName.toLowerCase()==="svg")return;for(var t,n=0;n<this.PRESENTATIONAL_ATTRIBUTES.length;n++)e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[n]);for(this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName)!==-1&&(e.removeAttribute("width"),e.removeAttribute("height")),t=e.firstElementChild;t!==null;)this._cleanStyles(t),t=t.nextElementSibling},_getLinkDensity:function(e){var t,n=this._getInnerText(e).length;return n===0?0:(t=0,this._forEachNode(e.getElementsByTagName("a"),function(e){var n=e.getAttribute("href"),s=n&&this.REGEXPS.hashUrl.test(n)?.3:1;t+=this._getInnerText(e).length*s}),t/n)},_getClassWeight:function(e){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))return 0;var t=0;return typeof e.className=="string"&&e.className!==""&&(this.REGEXPS.negative.test(e.className)&&(t-=25),this.REGEXPS.positive.test(e.className)&&(t+=25)),typeof e.id=="string"&&e.id!==""&&(this.REGEXPS.negative.test(e.id)&&(t-=25),this.REGEXPS.positive.test(e.id)&&(t+=25)),t},_clean:function(e,t){var n=["object","embed","iframe"].indexOf(t)!==-1;this._removeNodes(this._getAllNodesWithTag(e,[t]),function(e){if(n){for(var t=0;t<e.attributes.length;t++)if(this._allowedVideoRegex.test(e.attributes[t].value))return!1;if(e.tagName==="object"&&this._allowedVideoRegex.test(e.innerHTML))return!1}return!0})},_hasAncestorTag:function(e,t,n,s){n=n||3,t=t.toUpperCase();for(var o=0;e.parentNode;){if(n>0&&o>n)return!1;if(e.parentNode.tagName===t&&(!s||s(e.parentNode)))return!0;e=e.parentNode,o++}return!1},_getRowAndColumnCount:function(e){for(var t,n,o,r,c,l=0,i=0,a=e.getElementsByTagName("tr"),s=0;s<a.length;s++){t=a[s].getAttribute("rowspan")||0,t&&(t=parseInt(t,10)),l+=t||1;for(r=0,c=a[s].getElementsByTagName("td"),o=0;o<c.length;o++)n=c[o].getAttribute("colspan")||0,n&&(n=parseInt(n,10)),r+=n||1;i=Math.max(i,r)}return{rows:l,columns:i}},_markDataTables:function(e){for(var t,n,o,a,r,c,l,d,i=e.getElementsByTagName("table"),s=0;s<i.length;s++){if(t=i[s],a=t.getAttribute("role"),a=="presentation"){t._readabilityDataTable=!1;continue}if(r=t.getAttribute("datatable"),r=="0"){t._readabilityDataTable=!1;continue}if(c=t.getAttribute("summary"),c){t._readabilityDataTable=!0;continue}if(o=t.getElementsByTagName("caption")[0],o&&o.childNodes.length>0){t._readabilityDataTable=!0;continue}if(l=["col","colgroup","tfoot","thead","th"],d=function(e){return!!t.getElementsByTagName(e)[0]},l.some(d)){this.log("Data table because found data-y descendant"),t._readabilityDataTable=!0;continue}if(t.getElementsByTagName("table")[0]){t._readabilityDataTable=!1;continue}if(n=this._getRowAndColumnCount(t),n.rows>=10||n.columns>4){t._readabilityDataTable=!0;continue}t._readabilityDataTable=n.rows*n.columns>10}},_fixLazyImages:function(e){this._forEachNode(this._getAllNodesWithTag(e,["img","picture","figure"]),function(e){if(e.src&&this.REGEXPS.b64DataUrl.test(e.src)){var t,n,s,o,i,a,r,c,l=this.REGEXPS.b64DataUrl.exec(e.src);if(l[1]==="image/svg+xml")return;for(i=!1,s=0;s<e.attributes.length;s++){if(t=e.attributes[s],t.name==="src")continue;if(/\.(jpg|jpeg|png|webp)/i.test(t.value)){i=!0;break}}i&&(r=e.src.search(/base64\s*/i)+7,c=e.src.length-r,c<133&&e.removeAttribute("src"))}if((e.src||e.srcset&&e.srcset!="null")&&e.className.toLowerCase().indexOf("lazy")===-1)return;for(o=0;o<e.attributes.length;o++){if(t=e.attributes[o],t.name==="src"||t.name==="srcset"||t.name==="alt")continue;n=null,/\.(jpg|jpeg|png|webp)\s+\d/.test(t.value)?n="srcset":/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(t.value)&&(n="src"),n&&(e.tagName==="IMG"||e.tagName==="PICTURE"?e.setAttribute(n,t.value):e.tagName==="FIGURE"&&!this._getAllNodesWithTag(e,["img","picture"]).length&&(a=this._doc.createElement("img"),a.setAttribute(n,t.value),e.appendChild(a)))}})},_getTextDensity:function(e,t){var n,o,s=this._getInnerText(e,!0).length;return s===0?0:(n=0,o=this._getAllNodesWithTag(e,t),this._forEachNode(o,e=>n+=this._getInnerText(e,!0).length),n/s)},_cleanConditionally:function(e,t){if(!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))return;this._removeNodes(this._getAllNodesWithTag(e,[t]),function(e){var n,s,i,a,r,c,l,d,u,h,m,f,p,g,v,b,j,y=function(e){return e._readabilityDataTable},o=t==="ul"||t==="ol";if(o||(h=0,v=this._getAllNodesWithTag(e,["ul","ol"]),this._forEachNode(v,e=>h+=this._getInnerText(e).length),o=h/this._getInnerText(e).length>.9),t==="table"&&y(e))return!1;if(this._hasAncestorTag(e,"table",-1,y))return!1;if(this._hasAncestorTag(e,"code"))return!1;if(a=this._getClassWeight(e),this.log("Cleaning Conditionally",e),b=0,a+b<0)return!0;if(this._getCharCount(e,",")<10){for(c=e.getElementsByTagName("p").length,s=e.getElementsByTagName("img").length,j=e.getElementsByTagName("li").length-100,g=e.getElementsByTagName("input").length,p=this._getTextDensity(e,["h1","h2","h3","h4","h5","h6"]),u=0,i=this._getAllNodesWithTag(e,["object","embed","iframe"]),n=0;n<i.length;n++){for(r=0;r<i[n].attributes.length;r++)if(this._allowedVideoRegex.test(i[n].attributes[r].value))return!1;if(i[n].tagName==="object"&&this._allowedVideoRegex.test(i[n].innerHTML))return!1;u++}if(m=this._getLinkDensity(e),f=this._getInnerText(e).length,d=s>1&&c/s<.5&&!this._hasAncestorTag(e,"figure")||!o&&j>c||g>Math.floor(c/3)||!o&&p<.9&&f<25&&(s===0||s>2)&&!this._hasAncestorTag(e,"figure")||!o&&a<25&&m>.2||a>=25&&m>.5||u===1&&f<75||u>1,o&&d){for(l=0;l<e.children.length;l++){let t=e.children[l];if(t.children.length>1)return d}let t=e.getElementsByTagName("li").length;if(s==t)return!1}return d}return!1})},_cleanMatchedNodes:function(e,t){for(var s=this._getNextNode(e,!0),n=this._getNextNode(e);n&&n!=s;)t.call(this,n,n.className+" "+n.id)?n=this._removeAndGetNext(n):n=this._getNextNode(n)},_cleanHeaders:function(e){let t=this._getAllNodesWithTag(e,["h1","h2"]);this._removeNodes(t,function(e){let t=this._getClassWeight(e)<0;return t&&this.log("Removing header with low class weight:",e),t})},_headerDuplicatesTitle:function(e){if(e.tagName!="H1"&&e.tagName!="H2")return!1;var t=this._getInnerText(e,!1);return this.log("Evaluating similarity of header:",t,this._articleTitle),this._textSimilarity(this._articleTitle,t)>.75},_flagIsActive:function(e){return(this._flags&e)>0},_removeFlag:function(e){this._flags=this._flags&~e},_isProbablyVisible:function(e){return(!e.style||e.style.display!="none")&&!e.hasAttribute("hidden")&&(!e.hasAttribute("aria-hidden")||e.getAttribute("aria-hidden")!="true"||e.className&&e.className.indexOf&&e.className.indexOf("fallback-image")!==-1)},parse:function(){if(this._maxElemsToParse>0){var e,t,n,s,i,o=this._doc.getElementsByTagName("*").length;if(o>this._maxElemsToParse)throw new Error("Aborting parsing document; "+o+" elements found")}return this._unwrapNoscriptImages(this._doc),i=this._disableJSONLD?{}:this._getJSONLD(this._doc),this._removeScripts(this._doc),this._prepDocument(),e=this._getArticleMetadata(i),this._articleTitle=e.title,t=this._grabArticle(),t?(this.log("Grabbed: "+t.innerHTML),this._postProcessContent(t),e.excerpt||(n=t.getElementsByTagName("p"),n.length>0&&(e.excerpt=n[0].textContent.trim())),s=t.textContent,{title:this._articleTitle,byline:e.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang,content:this._serializer(t),textContent:s,length:s.length,excerpt:e.excerpt,siteName:e.siteName||this._articleSiteName}):null}},typeof module=="object"&&(module.exports=R)