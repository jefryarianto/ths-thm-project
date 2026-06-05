import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./utils-CMVnEVHk.js";import{M as i,f as a,m as o,t as s}from"./lucide-react-C2wKu_9A.js";function c({value:e,label:t,compact:n=!1,invert:s=!1}){let c=e>0,l=e<0,d=s?c?`text-red-600 dark:text-red-500`:l?`text-green-600 dark:text-green-500`:`text-muted-foreground`:c?`text-green-600 dark:text-green-500`:l?`text-red-600 dark:text-red-500`:`text-muted-foreground`,f=c?a:l?o:i,p=`${c?`+`:``}${e.toFixed(1)}%`;return(0,u.jsxs)(`span`,{className:r(`inline-flex items-center gap-0.5 font-medium`,d,n?`text-[11px]`:`text-xs`),children:[(0,u.jsx)(f,{className:r(n?`h-3 w-3`:`h-3.5 w-3.5`)}),(0,u.jsx)(`span`,{children:p}),t&&(0,u.jsx)(`span`,{className:`text-muted-foreground ml-0.5`,children:t})]})}function l({data:e,className:t}){if(e.length===0)return null;let n=Math.max(...e,1),i=Math.max(2,Math.floor(48/e.length)-1);return(0,u.jsx)(`svg`,{width:48,height:24,viewBox:`0 0 48 24`,className:r(`shrink-0`,t),children:e.map((t,r)=>{let a=t/n*24;return(0,u.jsx)(`rect`,{x:r*(i+1),y:24-a,width:i,height:Math.max(a,1),className:`fill-current`,opacity:.6+r/e.length*.4,rx:1},r)})})}var u,d=e((()=>{u=t(),n(),s(),c.__docgenInfo={description:``,methods:[],displayName:`TrendIndicator`,props:{value:{required:!0,tsType:{name:`number`},description:`Percentage change value (e.g., 12.5 for +12.5%, -5.3 for -5.3%)`},label:{required:!1,tsType:{name:`string`},description:`Optional label shown after the percentage`},compact:{required:!1,tsType:{name:`boolean`},description:`Show compact version (smaller text)`,defaultValue:{value:`false`,computed:!1}},invert:{required:!1,tsType:{name:`boolean`},description:`Invert colors (green for decrease, red for increase) — useful for cost metrics`,defaultValue:{value:`false`,computed:!1}}}},l.__docgenInfo={description:`Mini sparkline drawn as an inline SVG bar.
Accepts an array of numbers and renders small bars.`,methods:[],displayName:`MiniSparkline`,props:{data:{required:!0,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{f=t(),d(),p={title:`UI/TrendIndicator`,component:c,tags:[`autodocs`],argTypes:{value:{control:{type:`number`,min:-100,max:100,step:.1},description:`Persentase perubahan`},label:{control:`text`,description:`Label opsional (misal: vs bulan lalu)`},compact:{control:`boolean`,description:`Mode ringkas (ukuran teks lebih kecil)`},invert:{control:`boolean`,description:`Balik warna (positif=merah, negatif=hijau)`}}},m={args:{value:15.3,label:`vs bulan lalu`}},h={args:{value:-8.2}},g={args:{value:0}},_={args:{value:5.5,compact:!0}},v={args:{value:12,invert:!0},name:`Invert — Positif (Merah)`},y={args:{value:-12,invert:!0},name:`Invert — Negatif (Hijau)`},b={args:{value:3.2,label:`dari bulan sebelumnya`}},x={args:{value:99.9,label:`pertumbuhan`}},S={name:`5 Data Points`,render:()=>(0,f.jsx)(l,{data:[32e5,345e4,31e5,368e4,375e4]})},C={name:`3 Data Points`,render:()=>(0,f.jsx)(l,{data:[10,20,15]})},w={name:`Single Data Point`,render:()=>(0,f.jsx)(l,{data:[42]})},T={name:`Empty (No Data)`,render:()=>(0,f.jsx)(l,{data:[]})},E={name:`Increasing Trend`,render:()=>(0,f.jsx)(l,{data:[5,15,25,40,65,100]})},D={name:`Decreasing Trend`,render:()=>(0,f.jsx)(l,{data:[100,65,40,25,15,5]})},O={name:`With Custom Color`,render:()=>(0,f.jsx)(l,{data:[10,20,15,30,25],className:`text-blue-500`})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 15.3,
    label: "vs bulan lalu"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: -8.2
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    value: 5.5,
    compact: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    value: 12,
    invert: true
  },
  name: "Invert — Positif (Merah)"
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    value: -12,
    invert: true
  },
  name: "Invert — Negatif (Hijau)"
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3.2,
    label: "dari bulan sebelumnya"
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    value: 99.9,
    label: "pertumbuhan"
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "5 Data Points",
  render: () => <MiniSparkline data={[3200000, 3450000, 3100000, 3680000, 3750000]} />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "3 Data Points",
  render: () => <MiniSparkline data={[10, 20, 15]} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Single Data Point",
  render: () => <MiniSparkline data={[42]} />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "Empty (No Data)",
  render: () => <MiniSparkline data={[]} />
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "Increasing Trend",
  render: () => <MiniSparkline data={[5, 15, 25, 40, 65, 100]} />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "Decreasing Trend",
  render: () => <MiniSparkline data={[100, 65, 40, 25, 15, 5]} />
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: "With Custom Color",
  render: () => <MiniSparkline data={[10, 20, 15, 30, 25]} className="text-blue-500" />
}`,...O.parameters?.docs?.source}}},k=[`Positive`,`Negative`,`Neutral`,`Compact`,`InvertedPositive`,`InvertedNegative`,`WithLabel`,`DoubleDigit`,`FiveBars`,`ThreeBars`,`SingleBar`,`Empty`,`Increasing`,`Decreasing`,`Colored`]}))();export{O as Colored,_ as Compact,D as Decreasing,x as DoubleDigit,T as Empty,S as FiveBars,E as Increasing,y as InvertedNegative,v as InvertedPositive,h as Negative,g as Neutral,m as Positive,w as SingleBar,C as ThreeBars,b as WithLabel,k as __namedExportsOrder,p as default};