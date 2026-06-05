import{c as e,i as t}from"./preload-helper-D2yxXLVK.js";import{$ as n,j as r}from"./iframe-Cx3N5IyB.js";import{i,n as a,r as o,t as s}from"./useIsoLayoutEffect-D-CjYI9y.js";import{d as c,f as l,i as u,l as d,n as f,o as p,r as m,t as h,u as g}from"./useRenderElement-BBbIb_S-.js";import{i as _,n as v,r as y}from"./useButton-BwXpobz0.js";import{n as b,t as x}from"./utils-CMVnEVHk.js";import{n as S,t as C}from"./dist-BiFzeHEN.js";import{c as w,i as T,l as E,n as D,r as O,s as k,t as A}from"./useTransitionStatus-Daq5WQuC.js";import{_ as j,a as M,b as N,f as ee,i as P,l as F,n as te,o as ne,r as re,t as ie,x as ae}from"./owner-FsVHnBBF.js";import{n as oe,t as I}from"./useControlled-roU9Bq18.js";import{_ as se,a as L,c as ce,d as le,f as ue,g as de,h as fe,i as pe,m as me,n as he,o as ge,p as _e,r as ve,s as ye,t as be,u as xe,v as Se}from"./inertValue-DRjISUlm.js";import{E as Ce,S as we,T as Te,_ as Ee,at as De,b as Oe,g as ke,it as Ae,rt as je,t as Me,v as Ne,x as Pe,y as Fe}from"./utils-Bm1rskET.js";import{i as Ie,n as Le,o as Re,r as ze,s as Be,t as Ve}from"./CompositeList-9k3x8mDi.js";import{i as He,n as Ue,r as We,t as Ge}from"./isElementDisabled-eu8S59HD.js";import{S as Ke,W as qe,t as Je,w as Ye}from"./lucide-react-C2wKu_9A.js";function Xe(){let e=Ze.useContext(Qe);if(e===void 0)throw Error(c(64));return e}var Ze,Qe,R=t((()=>{l(),Ze=e(n()),Qe=Ze.createContext(void 0)})),$e,et=t((()=>{$e=function(e){return e.activationDirection=`data-activation-direction`,e.orientation=`data-orientation`,e}({})})),tt,nt=t((()=>{et(),tt={tabActivationDirection:e=>({[$e.activationDirection]:e})}}));function rt(e,t,n,r){if(e==null||t==null)return`none`;let i=null,a=null;for(let[n,o]of r.entries()){if(o==null)continue;let r=o.value??o.index;if(e===r&&(i=n),t===r&&(a=n),i!=null&&a!=null)break}if(i==null||a==null)return i!==a&&(typeof e==`number`||typeof e==`string`)&&typeof e==typeof t?n===`horizontal`?t>e?`right`:`left`:t>e?`down`:`up`:`none`;let o=i.getBoundingClientRect(),s=a.getBoundingClientRect();if(n===`horizontal`){if(s.left<o.left)return`left`;if(s.left>o.left)return`right`}else{if(s.top<o.top)return`up`;if(s.top>o.top)return`down`}return`none`}var z,it,at,ot=t((()=>{z=e(n()),I(),s(),o(),h(),Le(),R(),nt(),P(),F(),it=r(),at=z.forwardRef(function(e,t){let{className:n,defaultValue:r=0,onValueChange:o,orientation:s=`horizontal`,render:c,value:l,style:u,...d}=e,p=e.defaultValue!==void 0,m=z.useRef([]),[h,g]=z.useState(()=>new Map),[_,v]=oe({controlled:l,default:r,name:`Tabs`,state:`value`}),y=l!==void 0,[b,x]=z.useState(()=>new Map),S=z.useCallback(e=>{if(e===void 0)return null;for(let[t,n]of b.entries())if(n!=null&&e===(n.value??n.index))return t;return null},[b]),[C,w]=z.useState(()=>({previousValue:_,tabActivationDirection:`none`})),{previousValue:T,tabActivationDirection:E}=C,D=E,O=!1;T!==_&&(D=rt(T,_,s,b),O=T!=null&&_!=null&&S(_)==null);let k=O?T:_,A=T!==k||E!==D;a(()=>{A&&w({previousValue:k,tabActivationDirection:D})},[k,A,D]);let M=i((e,t)=>{t.activationDirection=rt(_,e,s,b),o?.(e,t),!t.isCanceled&&v(e)}),P=i((e,t)=>{o?.(e,re(t,void 0,void 0,{activationDirection:`none`}))}),F=i((e,t)=>{g(n=>{if(n.get(e)===t)return n;let r=new Map(n);return r.set(e,t),r})}),te=i((e,t)=>{g(n=>{if(!n.has(e)||n.get(e)!==t)return n;let r=new Map(n);return r.delete(e),r})}),ne=z.useCallback(e=>h.get(e),[h]),ie=z.useCallback(e=>{for(let t of b.values())if(e===t?.value)return t?.id},[b]),ae=z.useMemo(()=>({getTabElementBySelectedValue:S,getTabIdByPanelValue:ie,getTabPanelIdByValue:ne,onValueChange:M,orientation:s,registerMountedTabPanel:F,setTabMap:x,unregisterMountedTabPanel:te,tabActivationDirection:D,value:_}),[S,ie,ne,M,s,F,x,te,D,_]),I=z.useMemo(()=>{for(let e of b.values())if(e!=null&&e.value===_)return e},[b,_]),se=z.useMemo(()=>{for(let e of b.values())if(e!=null&&!e.disabled)return e.value},[b]),L=z.useRef(!p),ce=z.useRef(p),le=z.useRef(!1);a(()=>{if(y)return;function e(e,t){v(e),w(t=>t.previousValue===e&&t.tabActivationDirection===`none`?t:{previousValue:e,tabActivationDirection:`none`}),P(e,t),L.current=!1}if(b.size===0){if(!le.current||_===null)return;e(null,N);return}le.current=!0;let t=I?.disabled,n=I==null&&_!==null;if(!t&&_===r&&(ce.current=!1),ce.current&&t&&_===r)return;let i=L.current;if(t||n){let n=se??null;if(_===n){L.current=!1;return}let r=N;i?r=j:t&&(r=ee),e(n,r);return}i&&I!=null&&(P(_,j),L.current=!1)},[r,se,y,P,I,v,b,_]);let ue=f(`div`,e,{state:{orientation:s,tabActivationDirection:D},ref:t,props:d,stateAttributesMapping:tt});return(0,it.jsx)(Qe.Provider,{value:ae,children:(0,it.jsx)(Ve,{elementsRef:m,children:ue})})})})),st,ct=t((()=>{st=`data-composite-item-active`}));function lt(){let e=ut.useContext(dt);if(e===void 0)throw Error(c(65));return e}var ut,dt,ft=t((()=>{l(),ut=e(n()),dt=ut.createContext(void 0)})),B,pt,mt=t((()=>{B=e(n()),ie(),s(),M(),h(),Se(),ct(),We(),R(),ft(),P(),F(),Me(),pt=B.forwardRef(function(e,t){let{className:n,disabled:r=!1,render:i,value:o,id:s,nativeButton:c=!0,style:l,...u}=e,{value:d,getTabPanelIdByValue:p,orientation:m}=Xe(),{activateOnFocus:h,highlightedTabIndex:g,onTabActivation:_,registerTabResizeObserverElement:y,setHighlightedTabIndex:b,tabsListElement:x}=lt(),S=ne(s),{compositeProps:C,compositeRef:w,index:T}=He({metadata:B.useMemo(()=>({disabled:r,id:S,value:o}),[r,S,o])}),E=o===d,D=B.useRef(!1),O=B.useRef(null);B.useEffect(()=>{let e=O.current;if(e)return y(e)},[y]),a(()=>{if(D.current){D.current=!1;return}if(!(E&&T>-1&&g!==T))return;let e=x;if(e!=null){let t=je(te(e));if(t&&Ae(e,t))return}r||b(T)},[E,T,g,b,r,x]);let{getButtonProps:k,buttonRef:A}=v({disabled:r,native:c,focusableWhenDisabled:!0}),j=p(o),M=B.useRef(!1),N=B.useRef(!1);function ee(e){E||r||_(o,re(ae,e.nativeEvent,void 0,{activationDirection:`none`}))}function P(e){E||(T>-1&&!r&&b(T),!r&&h&&(!M.current||M.current&&N.current)&&_(o,re(ae,e.nativeEvent,void 0,{activationDirection:`none`})))}function F(e){if(E||r)return;M.current=!0;function t(){M.current=!1,N.current=!1}(!e.button||e.button===0)&&(N.current=!0,te(e.currentTarget).addEventListener(`pointerup`,t,{once:!0}))}return f(`button`,e,{state:{disabled:r,active:E,orientation:m},ref:[t,A,w,O],props:[C,{role:`tab`,"aria-controls":j,"aria-selected":E,id:S,onClick:ee,onFocus:P,onPointerDown:F,[st]:E?``:void 0,onKeyDownCapture(){D.current=!0}},u,k]})})})),ht,gt=t((()=>{w(),ht=function(e){return e.index=`data-index`,e.activationDirection=`data-activation-direction`,e.orientation=`data-orientation`,e.hidden=`data-hidden`,e[e.startingStyle=k.startingStyle]=`startingStyle`,e[e.endingStyle=k.endingStyle]=`endingStyle`,e}({})})),_t,vt,yt,bt=t((()=>{_t=e(n()),he(),s(),M(),w(),O(),A(),h(),Re(),nt(),R(),gt(),vt={...tt,...E},yt=_t.forwardRef(function(e,t){let{className:n,value:r,render:i,keepMounted:o=!1,style:s,...c}=e,{value:l,getTabIdByPanelValue:u,orientation:d,tabActivationDirection:p,registerMountedTabPanel:m,unregisterMountedTabPanel:h}=Xe(),g=ne(),{ref:_,index:v}=Be({metadata:_t.useMemo(()=>({id:g,value:r}),[g,r])}),y=r===l,{mounted:b,transitionStatus:x,setMounted:S}=D(y),C=!b,w=u(r),E={hidden:C,orientation:d,tabActivationDirection:p,transitionStatus:x},O=_t.useRef(null),k=f(`div`,e,{state:E,ref:[t,_,O],props:[{"aria-labelledby":w,hidden:C,id:g,role:`tabpanel`,tabIndex:y?0:-1,inert:be(!y),[ht.index]:v},c],stateAttributesMapping:vt});return T({open:y,ref:O,onComplete(){y||S(!1)}}),a(()=>{if(!(C&&!o)&&g!=null)return m(r,g),()=>{h(r,g)}},[C,o,r,g,m,h]),o||b?k:null})}));function xt(e){let{itemSizes:t,cols:n=1,loopFocus:r=!0,onLoop:a,dense:o=!1,orientation:s=`both`,direction:c,highlightedIndex:l,onHighlightedIndexChange:u,rootRef:d,enableHomeAndEndKeys:f=!1,stopEventPropagation:p=!1,disabledIndices:m,modifierKeys:h=Ct}=e,[_,v]=V.useState(0),y=n>1,b=V.useRef(null),x=g(b,d),S=V.useRef([]),C=V.useRef(!1),w=l??_,T=i((e,t=!1)=>{if((u??v)(e),t){let t=S.current[e];se(b.current,t,c,s)}}),E=i(e=>{if(e.size===0||C.current)return;C.current=!0;let t=Array.from(e.keys()),n=t.find(e=>e?.hasAttribute(`data-composite-item-active`))??null,r=n?t.indexOf(n):-1;r!==-1&&T(r),se(b.current,n,c,s)}),D=i((e,t,n)=>a?a?.(e,t,n,S):n),O=V.useMemo(()=>({"aria-orientation":s===`both`?void 0:s,ref:x,onFocus(e){let t=b.current,n=De(e.nativeEvent);!t||n==null||!de(n)||n.setSelectionRange(0,n.value.length??0)},onKeyDown(e){let i=f?ce:pe;if(!i.has(e.key)||St(e,h)||!b.current)return;let l=c===`rtl`,u=l?L:ge,d={horizontal:u,vertical:ve,both:u}[s],g=l?ge:L,_={horizontal:g,vertical:ye,both:g}[s],v=De(e.nativeEvent);if(v!=null&&de(v)&&!Ue(v)){let t=v.selectionStart,n=v.selectionEnd,r=v.value??``;if(t==null||e.shiftKey||t!==n||e.key!==_&&t<r.length||e.key!==d&&t>0)return}let x=w,C=we(S,m),E=Pe(S,m);if(y){let i=t||Array.from({length:S.current.length},()=>({width:1,height:1})),a=ke(i,n,o),c=a.findIndex(e=>e!=null&&!Ce(S.current,e,m)),u=a.reduce((e,t,n)=>t!=null&&!Ce(S.current,t,m)?n:e,-1);x=a[Oe(a.map(e=>e==null?null:S.current[e]),{event:e,orientation:s,loopFocus:r,onLoop:D,cols:n,disabledIndices:Fe([...m||S.current.map((e,t)=>Ce(S.current,t)?t:void 0),void 0],a),minIndex:c,maxIndex:u,prevIndex:Ne(w>E?C:w,i,a,n,e.key===`ArrowDown`?`bl`:e.key===`ArrowRight`?`tr`:`tl`),rtl:l})]}let O={horizontal:[u],vertical:[ve],both:[u,ve]}[s],k={horizontal:[g],vertical:[ye],both:[g,ye]}[s],A=y?i:{horizontal:f?le:xe,vertical:f?me:_e,both:i}[s];f&&(e.key===`Home`?x=C:e.key===`End`&&(x=E)),x===w&&(O.includes(e.key)||k.includes(e.key))&&(r&&x===E&&O.includes(e.key)?(x=C,a&&(x=a(e,w,x,S))):r&&x===C&&k.includes(e.key)?(x=E,a&&(x=a(e,w,x,S))):x=Ee(S.current,{startingIndex:x,decrement:k.includes(e.key),disabledIndices:m})),x!==w&&!Te(S.current,x)&&(p&&e.stopPropagation(),A.has(e.key)&&e.preventDefault(),T(x,!0),queueMicrotask(()=>{S.current[x]?.focus()}))}}),[n,o,c,m,S,f,w,y,t,r,a,D,x,h,T,s,p]);return V.useMemo(()=>({props:O,highlightedIndex:w,onHighlightedIndexChange:T,elementsRef:S,disabledIndices:m,onMapChange:E,relayKeyboardEvent:O.onKeyDown}),[O,w,T,S,m,E])}function St(e,t){for(let n of ue.values())if(!t.includes(n)&&e.getModifierState(n))return!0;return!1}var V,Ct,wt=t((()=>{V=e(n()),Ge(),o(),d(),fe(),ct(),Me(),Ct=[]}));function Tt(e){let{render:t,className:n,style:r,refs:i=m,props:a=m,state:o=u,stateAttributesMapping:s,highlightedIndex:c,onHighlightedIndexChange:l,orientation:d,dense:p,itemSizes:h,loopFocus:g,onLoop:_,cols:v,enableHomeAndEndKeys:b,onMapChange:x,stopEventPropagation:S=!0,rootRef:C,disabledIndices:w,modifierKeys:T,highlightItemOnHover:E=!1,tag:D=`div`,...O}=e,{props:k,highlightedIndex:A,onHighlightedIndexChange:j,elementsRef:M,onMapChange:N,relayKeyboardEvent:ee}=xt({itemSizes:h,cols:v,loopFocus:g,onLoop:_,dense:p,orientation:d,highlightedIndex:c,onHighlightedIndexChange:l,rootRef:C,stopEventPropagation:S,enableHomeAndEndKeys:b,direction:Ie(),disabledIndices:w,modifierKeys:T}),P=f(D,e,{state:o,ref:i,props:[k,...a,O],stateAttributesMapping:s}),F=Et.useMemo(()=>({highlightedIndex:A,onHighlightedIndexChange:j,highlightItemOnHover:E,relayKeyboardEvent:ee}),[A,j,E,ee]);return(0,Dt.jsx)(y.Provider,{value:F,children:(0,Dt.jsx)(Ve,{elementsRef:M,onMapChange:e=>{x?.(e),N(e)},children:P})})}var Et,Dt,Ot=t((()=>{Et=e(n()),p(),Le(),wt(),_(),h(),ze(),Dt=r()})),H,kt,At,jt=t((()=>{H=e(n()),o(),p(),Ot(),nt(),R(),ft(),kt=r(),At=H.forwardRef(function(e,t){let{activateOnFocus:n=!1,className:r,loopFocus:a=!0,render:o,style:s,...c}=e,{onValueChange:l,orientation:u,value:d,setTabMap:f,tabActivationDirection:p}=Xe(),[h,g]=H.useState(0),[_,v]=H.useState(null),y=H.useRef(new Set),b=H.useRef(new Set),x=H.useRef(null);H.useEffect(()=>{if(typeof ResizeObserver>`u`)return;let e=new ResizeObserver(()=>{y.current.forEach(e=>{e()})});return x.current=e,_&&e.observe(_),b.current.forEach(t=>{e.observe(t)}),()=>{e.disconnect(),x.current=null}},[_]);let S=i(e=>(y.current.add(e),()=>{y.current.delete(e)})),C=i(e=>(b.current.add(e),x.current?.observe(e),()=>{b.current.delete(e),x.current?.unobserve(e)})),w=i((e,t)=>{e!==d&&l(e,t)}),T={orientation:u,tabActivationDirection:p},E={"aria-orientation":u===`vertical`?`vertical`:void 0,role:`tablist`},D=H.useMemo(()=>({activateOnFocus:n,highlightedTabIndex:h,registerIndicatorUpdateListener:S,registerTabResizeObserverElement:C,onTabActivation:w,setHighlightedTabIndex:g,tabsListElement:_}),[n,h,S,C,w,g,_]);return(0,kt.jsx)(dt.Provider,{value:D,children:(0,kt.jsx)(Tt,{render:o,className:r,style:s,state:T,refs:[t,v],props:[E,c],stateAttributesMapping:tt,highlightedIndex:h,enableHomeAndEndKeys:!0,loopFocus:a,orientation:u,onHighlightedIndexChange:g,onMapChange:f,disabledIndices:m})})})})),Mt=t((()=>{ot(),mt(),R(),nt(),ft(),bt(),jt()})),Nt=t((()=>{Mt()}));function U({className:e,orientation:t=`horizontal`,...n}){return(0,Pt.jsx)(at,{"data-slot":`tabs`,"data-orientation":t,className:x(`group/tabs flex gap-2 data-horizontal:flex-col`,e),...n})}function W({className:e,variant:t=`default`,...n}){return(0,Pt.jsx)(At,{"data-slot":`tabs-list`,"data-variant":t,className:x(Ft({variant:t}),e),...n})}function G({className:e,...t}){return(0,Pt.jsx)(pt,{"data-slot":`tabs-trigger`,className:x(`relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,`group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent`,`data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground`,`after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100`,e),...t})}function K({className:e,...t}){return(0,Pt.jsx)(yt,{"data-slot":`tabs-content`,className:x(`flex-1 text-sm outline-none`,e),...t})}var Pt,Ft,It=t((()=>{Pt=r(),Nt(),S(),b(),Ft=C(`group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none`,{variants:{variant:{default:`bg-muted`,line:`gap-1 bg-transparent`}},defaultVariants:{variant:`default`}}),U.__docgenInfo={description:``,methods:[],displayName:`Tabs`,props:{orientation:{defaultValue:{value:`"horizontal"`,computed:!1},required:!1}}},W.__docgenInfo={description:``,methods:[],displayName:`TabsList`,props:{variant:{defaultValue:{value:`"default"`,computed:!1},required:!1}}},G.__docgenInfo={description:``,methods:[],displayName:`TabsTrigger`},K.__docgenInfo={description:``,methods:[],displayName:`TabsContent`}})),q,Lt,J,Y,X,Z,Q,$,Rt;t((()=>{q=r(),It(),Je(),Lt={title:`UI/Tabs`,component:U,parameters:{layout:`centered`},tags:[`autodocs`]},J={render:()=>(0,q.jsxs)(U,{defaultValue:`account`,className:`w-[400px]`,children:[(0,q.jsxs)(W,{children:[(0,q.jsx)(G,{value:`account`,children:`Account`}),(0,q.jsx)(G,{value:`password`,children:`Password`}),(0,q.jsx)(G,{value:`settings`,children:`Settings`})]}),(0,q.jsx)(K,{value:`account`,children:(0,q.jsxs)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:[(0,q.jsx)(`h3`,{className:`font-medium`,children:`Account Settings`}),(0,q.jsx)(`p`,{className:`mt-1 text-muted-foreground`,children:`Manage your account details and preferences.`})]})}),(0,q.jsx)(K,{value:`password`,children:(0,q.jsxs)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:[(0,q.jsx)(`h3`,{className:`font-medium`,children:`Password`}),(0,q.jsx)(`p`,{className:`mt-1 text-muted-foreground`,children:`Change your password and security settings.`})]})}),(0,q.jsx)(K,{value:`settings`,children:(0,q.jsxs)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:[(0,q.jsx)(`h3`,{className:`font-medium`,children:`General Settings`}),(0,q.jsx)(`p`,{className:`mt-1 text-muted-foreground`,children:`Configure general application settings.`})]})})]})},Y={render:()=>(0,q.jsxs)(U,{defaultValue:`tab1`,className:`w-[500px]`,children:[(0,q.jsxs)(W,{variant:`line`,children:[(0,q.jsx)(G,{value:`tab1`,children:`Overview`}),(0,q.jsx)(G,{value:`tab2`,children:`Analytics`}),(0,q.jsx)(G,{value:`tab3`,children:`Reports`}),(0,q.jsx)(G,{value:`tab4`,children:`History`})]}),(0,q.jsx)(K,{value:`tab1`,children:(0,q.jsx)(`div`,{className:`mt-3 rounded-lg border p-4 text-sm`,children:`Overview content with key metrics and summaries.`})}),(0,q.jsx)(K,{value:`tab2`,children:(0,q.jsx)(`div`,{className:`mt-3 rounded-lg border p-4 text-sm`,children:`Analytics dashboard with charts and data.`})}),(0,q.jsx)(K,{value:`tab3`,children:(0,q.jsx)(`div`,{className:`mt-3 rounded-lg border p-4 text-sm`,children:`Generate and view reports here.`})}),(0,q.jsx)(K,{value:`tab4`,children:(0,q.jsx)(`div`,{className:`mt-3 rounded-lg border p-4 text-sm`,children:`View activity history and audit logs.`})})]})},X={render:()=>(0,q.jsxs)(U,{defaultValue:`tab1`,orientation:`vertical`,className:`w-[400px]`,children:[(0,q.jsxs)(W,{children:[(0,q.jsx)(G,{value:`tab1`,children:`Tab 1`}),(0,q.jsx)(G,{value:`tab2`,children:`Tab 2`}),(0,q.jsx)(G,{value:`tab3`,children:`Tab 3`})]}),(0,q.jsx)(K,{value:`tab1`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`Vertical tabs content for tab 1.`})}),(0,q.jsx)(K,{value:`tab2`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`Vertical tabs content for tab 2.`})}),(0,q.jsx)(K,{value:`tab3`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`Vertical tabs content for tab 3.`})})]})},Z={render:()=>(0,q.jsxs)(U,{defaultValue:`single`,className:`w-[400px]`,children:[(0,q.jsx)(W,{children:(0,q.jsx)(G,{value:`single`,children:`Single Tab`})}),(0,q.jsx)(K,{value:`single`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`A minimal tabs example with just one tab.`})})]})},Q={render:()=>(0,q.jsxs)(U,{defaultValue:`general`,className:`w-[400px]`,children:[(0,q.jsxs)(W,{children:[(0,q.jsx)(G,{value:`general`,children:`General`}),(0,q.jsx)(G,{value:`advanced`,disabled:!0,children:`Advanced`}),(0,q.jsx)(G,{value:`beta`,disabled:!0,children:`Beta (Coming Soon)`})]}),(0,q.jsx)(K,{value:`general`,children:(0,q.jsxs)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:[(0,q.jsx)(`h3`,{className:`font-medium`,children:`General Settings`}),(0,q.jsx)(`p`,{className:`mt-1 text-muted-foreground`,children:`These settings are available now. Advanced and Beta tabs are disabled.`})]})}),(0,q.jsx)(K,{value:`advanced`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:(0,q.jsx)(`p`,{className:`text-muted-foreground`,children:`Advanced options — not yet available.`})})}),(0,q.jsx)(K,{value:`beta`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:(0,q.jsx)(`p`,{className:`text-muted-foreground`,children:`Beta features — coming in a future release.`})})})]})},$={render:()=>(0,q.jsxs)(U,{defaultValue:`home`,className:`w-[400px]`,children:[(0,q.jsxs)(W,{children:[(0,q.jsxs)(G,{value:`home`,children:[(0,q.jsx)(qe,{}),`Home`]}),(0,q.jsxs)(G,{value:`search`,children:[(0,q.jsx)(Ye,{}),`Search`]}),(0,q.jsxs)(G,{value:`settings`,children:[(0,q.jsx)(Ke,{}),`Settings`]})]}),(0,q.jsx)(K,{value:`home`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`Home dashboard content with recent activity.`})}),(0,q.jsx)(K,{value:`search`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`Search results and filters.`})}),(0,q.jsx)(K,{value:`settings`,children:(0,q.jsx)(`div`,{className:`mt-2 rounded-lg border p-4 text-sm`,children:`Application preferences and configuration.`})})]})},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="account" className="w-[400px]">\r
      <TabsList>\r
        <TabsTrigger value="account">Account</TabsTrigger>\r
        <TabsTrigger value="password">Password</TabsTrigger>\r
        <TabsTrigger value="settings">Settings</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="account">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          <h3 className="font-medium">Account Settings</h3>\r
          <p className="mt-1 text-muted-foreground">\r
            Manage your account details and preferences.\r
          </p>\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="password">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          <h3 className="font-medium">Password</h3>\r
          <p className="mt-1 text-muted-foreground">\r
            Change your password and security settings.\r
          </p>\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="settings">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          <h3 className="font-medium">General Settings</h3>\r
          <p className="mt-1 text-muted-foreground">\r
            Configure general application settings.\r
          </p>\r
        </div>\r
      </TabsContent>\r
    </Tabs>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="tab1" className="w-[500px]">\r
      <TabsList variant="line">\r
        <TabsTrigger value="tab1">Overview</TabsTrigger>\r
        <TabsTrigger value="tab2">Analytics</TabsTrigger>\r
        <TabsTrigger value="tab3">Reports</TabsTrigger>\r
        <TabsTrigger value="tab4">History</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="tab1">\r
        <div className="mt-3 rounded-lg border p-4 text-sm">\r
          Overview content with key metrics and summaries.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="tab2">\r
        <div className="mt-3 rounded-lg border p-4 text-sm">\r
          Analytics dashboard with charts and data.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="tab3">\r
        <div className="mt-3 rounded-lg border p-4 text-sm">\r
          Generate and view reports here.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="tab4">\r
        <div className="mt-3 rounded-lg border p-4 text-sm">\r
          View activity history and audit logs.\r
        </div>\r
      </TabsContent>\r
    </Tabs>
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="tab1" orientation="vertical" className="w-[400px]">\r
      <TabsList>\r
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>\r
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>\r
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="tab1">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          Vertical tabs content for tab 1.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="tab2">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          Vertical tabs content for tab 2.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="tab3">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          Vertical tabs content for tab 3.\r
        </div>\r
      </TabsContent>\r
    </Tabs>
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="single" className="w-[400px]">\r
      <TabsList>\r
        <TabsTrigger value="single">Single Tab</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="single">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          A minimal tabs example with just one tab.\r
        </div>\r
      </TabsContent>\r
    </Tabs>
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="general" className="w-[400px]">\r
      <TabsList>\r
        <TabsTrigger value="general">General</TabsTrigger>\r
        <TabsTrigger value="advanced" disabled>Advanced</TabsTrigger>\r
        <TabsTrigger value="beta" disabled>Beta (Coming Soon)</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="general">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          <h3 className="font-medium">General Settings</h3>\r
          <p className="mt-1 text-muted-foreground">\r
            These settings are available now. Advanced and Beta tabs are disabled.\r
          </p>\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="advanced">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          <p className="text-muted-foreground">Advanced options — not yet available.</p>\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="beta">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          <p className="text-muted-foreground">Beta features — coming in a future release.</p>\r
        </div>\r
      </TabsContent>\r
    </Tabs>
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="home" className="w-[400px]">\r
      <TabsList>\r
        <TabsTrigger value="home">\r
          <HomeIcon />\r
          Home\r
        </TabsTrigger>\r
        <TabsTrigger value="search">\r
          <SearchIcon />\r
          Search\r
        </TabsTrigger>\r
        <TabsTrigger value="settings">\r
          <SettingsIcon />\r
          Settings\r
        </TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="home">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          Home dashboard content with recent activity.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="search">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          Search results and filters.\r
        </div>\r
      </TabsContent>\r
      <TabsContent value="settings">\r
        <div className="mt-2 rounded-lg border p-4 text-sm">\r
          Application preferences and configuration.\r
        </div>\r
      </TabsContent>\r
    </Tabs>
}`,...$.parameters?.docs?.source}}},Rt=[`Default`,`LineVariant`,`Vertical`,`SingleTab`,`DisabledTab`,`WithIcons`]}))();export{J as Default,Q as DisabledTab,Y as LineVariant,Z as SingleTab,X as Vertical,$ as WithIcons,Rt as __namedExportsOrder,Lt as default};