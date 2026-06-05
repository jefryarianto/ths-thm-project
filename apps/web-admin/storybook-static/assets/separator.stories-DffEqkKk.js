import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./separator-D73fDbtQ.js";var i,a,o,s,c,l,u,d;e((()=>{i=t(),n(),a={title:`UI/Separator`,component:r,parameters:{layout:`centered`},tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]}}},o={render:()=>(0,i.jsxs)(`div`,{className:`w-[300px] space-y-2`,children:[(0,i.jsx)(`p`,{className:`text-sm`,children:`Content above separator`}),(0,i.jsx)(r,{}),(0,i.jsx)(`p`,{className:`text-sm`,children:`Content below separator`})]})},s={render:()=>(0,i.jsxs)(`div`,{className:`flex h-[100px] items-center gap-4`,children:[(0,i.jsx)(`span`,{className:`text-sm`,children:`Left`}),(0,i.jsx)(r,{orientation:`vertical`}),(0,i.jsx)(`span`,{className:`text-sm`,children:`Center`}),(0,i.jsx)(r,{orientation:`vertical`}),(0,i.jsx)(`span`,{className:`text-sm`,children:`Right`})]})},c={render:()=>(0,i.jsxs)(`div`,{className:`w-[300px] space-y-4`,children:[(0,i.jsx)(`p`,{className:`text-sm`,children:`Section 1`}),(0,i.jsx)(r,{className:`my-2`}),(0,i.jsx)(`p`,{className:`text-sm`,children:`Section 2`}),(0,i.jsx)(r,{className:`my-2`}),(0,i.jsx)(`p`,{className:`text-sm`,children:`Section 3`})]})},l={render:()=>(0,i.jsxs)(`div`,{className:`w-[300px] rounded-lg border p-4`,children:[(0,i.jsxs)(`div`,{className:`space-y-1`,children:[(0,i.jsx)(`h4`,{className:`text-sm font-medium`,children:`Settings`}),(0,i.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Manage your preferences`})]}),(0,i.jsx)(r,{className:`my-3`}),(0,i.jsxs)(`div`,{className:`space-y-2`,children:[(0,i.jsx)(`p`,{className:`text-sm`,children:`Notification preferences`}),(0,i.jsx)(`p`,{className:`text-sm`,children:`Privacy settings`})]}),(0,i.jsx)(r,{className:`my-3`}),(0,i.jsxs)(`div`,{className:`space-y-2`,children:[(0,i.jsx)(`p`,{className:`text-sm`,children:`Account`}),(0,i.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Delete account`})]})]})},u={render:()=>(0,i.jsxs)(`div`,{className:`w-[200px] rounded-lg border p-2 shadow-sm`,children:[(0,i.jsx)(`div`,{className:`px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer`,children:`Edit`}),(0,i.jsx)(`div`,{className:`px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer`,children:`Copy`}),(0,i.jsx)(`div`,{className:`px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer`,children:`Paste`}),(0,i.jsx)(r,{className:`my-1`}),(0,i.jsx)(`div`,{className:`px-2 py-1 text-sm text-destructive hover:bg-muted rounded cursor-pointer`,children:`Delete`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px] space-y-2">\r
      <p className="text-sm">Content above separator</p>\r
      <Separator />\r
      <p className="text-sm">Content below separator</p>\r
    </div>
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-[100px] items-center gap-4">\r
      <span className="text-sm">Left</span>\r
      <Separator orientation="vertical" />\r
      <span className="text-sm">Center</span>\r
      <Separator orientation="vertical" />\r
      <span className="text-sm">Right</span>\r
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px] space-y-4">\r
      <p className="text-sm">Section 1</p>\r
      <Separator className="my-2" />\r
      <p className="text-sm">Section 2</p>\r
      <Separator className="my-2" />\r
      <p className="text-sm">Section 3</p>\r
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px] rounded-lg border p-4">\r
      <div className="space-y-1">\r
        <h4 className="text-sm font-medium">Settings</h4>\r
        <p className="text-sm text-muted-foreground">Manage your preferences</p>\r
      </div>\r
      <Separator className="my-3" />\r
      <div className="space-y-2">\r
        <p className="text-sm">Notification preferences</p>\r
        <p className="text-sm">Privacy settings</p>\r
      </div>\r
      <Separator className="my-3" />\r
      <div className="space-y-2">\r
        <p className="text-sm">Account</p>\r
        <p className="text-sm text-muted-foreground">Delete account</p>\r
      </div>\r
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[200px] rounded-lg border p-2 shadow-sm">\r
      <div className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">Edit</div>\r
      <div className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">Copy</div>\r
      <div className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">Paste</div>\r
      <Separator className="my-1" />\r
      <div className="px-2 py-1 text-sm text-destructive hover:bg-muted rounded cursor-pointer">Delete</div>\r
    </div>
}`,...u.parameters?.docs?.source}}},d=[`Horizontal`,`Vertical`,`WithLabel`,`InCard`,`MenuSeparator`]}))();export{o as Horizontal,l as InCard,u as MenuSeparator,s as Vertical,c as WithLabel,d as __namedExportsOrder,a as default};