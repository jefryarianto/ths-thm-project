import{c as e,i as t}from"./preload-helper-D2yxXLVK.js";import{$ as n,j as r}from"./iframe-Cx3N5IyB.js";import{n as i,t as a}from"./button-1uNtGEHO.js";import{n as o,t as s}from"./utils-CMVnEVHk.js";import{n as c,t as l}from"./lucide-react-C2wKu_9A.js";import{c as u,f as d,g as f,i as p,m,n as h,o as g,t as _,u as v}from"./dialog-ByXXrODD.js";function y({...e}){return(0,k.jsx)(g,{"data-slot":`sheet`,...e})}function b({...e}){return(0,k.jsx)(h,{"data-slot":`sheet-trigger`,...e})}function x({...e}){return(0,k.jsx)(m,{"data-slot":`sheet-close`,...e})}function S({...e}){return(0,k.jsx)(u,{"data-slot":`sheet-portal`,...e})}function C({className:e,...t}){return(0,k.jsx)(f,{"data-slot":`sheet-overlay`,className:s(`fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs`,e),...t})}function w({className:e,children:t,side:n=`right`,showCloseButton:r=!0,...i}){return(0,k.jsxs)(S,{children:[(0,k.jsx)(C,{}),(0,k.jsxs)(v,{"data-slot":`sheet-content`,"data-side":n,className:s(`fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm`,e),...i,children:[t,r&&(0,k.jsxs)(m,{"data-slot":`sheet-close`,render:(0,k.jsx)(a,{variant:`ghost`,className:`absolute top-3 right-3`,size:`icon-sm`}),children:[(0,k.jsx)(c,{}),(0,k.jsx)(`span`,{className:`sr-only`,children:`Close`})]})]})]})}function T({className:e,...t}){return(0,k.jsx)(`div`,{"data-slot":`sheet-header`,className:s(`flex flex-col gap-0.5 p-4`,e),...t})}function E({className:e,...t}){return(0,k.jsx)(`div`,{"data-slot":`sheet-footer`,className:s(`mt-auto flex flex-col gap-2 p-4`,e),...t})}function D({className:e,...t}){return(0,k.jsx)(p,{"data-slot":`sheet-title`,className:s(`text-base font-medium text-foreground`,e),...t})}function O({className:e,...t}){return(0,k.jsx)(d,{"data-slot":`sheet-description`,className:s(`text-sm text-muted-foreground`,e),...t})}var k,A=t((()=>{k=r(),_(),o(),i(),l(),y.__docgenInfo={description:``,methods:[],displayName:`Sheet`},b.__docgenInfo={description:``,methods:[],displayName:`SheetTrigger`},x.__docgenInfo={description:``,methods:[],displayName:`SheetClose`},w.__docgenInfo={description:``,methods:[],displayName:`SheetContent`,props:{side:{required:!1,tsType:{name:`union`,raw:`"top" | "right" | "bottom" | "left"`,elements:[{name:`literal`,value:`"top"`},{name:`literal`,value:`"right"`},{name:`literal`,value:`"bottom"`},{name:`literal`,value:`"left"`}]},description:``,defaultValue:{value:`"right"`,computed:!1}},showCloseButton:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`true`,computed:!1}}}},T.__docgenInfo={description:``,methods:[],displayName:`SheetHeader`},E.__docgenInfo={description:``,methods:[],displayName:`SheetFooter`},D.__docgenInfo={description:``,methods:[],displayName:`SheetTitle`},O.__docgenInfo={description:``,methods:[],displayName:`SheetDescription`}})),j,M,N,P,F,I,L,R,z;t((()=>{j=r(),M=e(n()),A(),i(),N={title:`UI/Sheet`,component:y,parameters:{layout:`centered`},tags:[`autodocs`]},P={render:()=>(0,j.jsxs)(y,{defaultOpen:!0,children:[(0,j.jsx)(b,{render:(0,j.jsx)(a,{variant:`outline`,children:`Open Sheet (Right)`})}),(0,j.jsxs)(w,{side:`right`,children:[(0,j.jsxs)(T,{children:[(0,j.jsx)(D,{children:`Sheet Title`}),(0,j.jsx)(O,{children:`This is a sheet panel that slides in from the right side.`})]}),(0,j.jsx)(`div`,{className:`flex-1 px-4 text-sm text-muted-foreground`,children:(0,j.jsx)(`p`,{children:`Main content area. Add your form or content here.`})}),(0,j.jsxs)(E,{children:[(0,j.jsx)(a,{variant:`outline`,children:`Cancel`}),(0,j.jsx)(a,{children:`Save`})]})]})]})},F={render:()=>(0,j.jsxs)(y,{defaultOpen:!0,children:[(0,j.jsx)(b,{render:(0,j.jsx)(a,{variant:`outline`,children:`Open Sheet (Left)`})}),(0,j.jsxs)(w,{side:`left`,children:[(0,j.jsxs)(T,{children:[(0,j.jsx)(D,{children:`Navigation`}),(0,j.jsx)(O,{children:`Slide-in navigation panel from the left side.`})]}),(0,j.jsx)(`nav`,{className:`flex flex-col gap-1 px-4`,children:[`Dashboard`,`Profile`,`Settings`,`Help`].map(e=>(0,j.jsx)(a,{variant:`ghost`,className:`justify-start`,children:e},e))})]})]})},I={render:()=>(0,j.jsxs)(y,{defaultOpen:!0,children:[(0,j.jsx)(b,{render:(0,j.jsx)(a,{variant:`outline`,children:`Open Sheet (Top)`})}),(0,j.jsxs)(w,{side:`top`,className:`p-6`,children:[(0,j.jsx)(D,{children:`Notification Preferences`}),(0,j.jsx)(`div`,{className:`py-4 text-sm text-muted-foreground`,children:`Configure how you receive notifications.`})]})]})},L={render:()=>(0,j.jsxs)(y,{defaultOpen:!0,children:[(0,j.jsx)(b,{render:(0,j.jsx)(a,{variant:`outline`,children:`Open Sheet (Bottom)`})}),(0,j.jsxs)(w,{side:`bottom`,className:`p-6`,children:[(0,j.jsx)(D,{children:`Quick Actions`}),(0,j.jsx)(`div`,{className:`mt-4 grid grid-cols-3 gap-3`,children:[`Share`,`Edit`,`Delete`,`Copy`,`Move`,`Archive`].map(e=>(0,j.jsx)(a,{variant:`outline`,className:`w-full`,children:e},e))})]})]})},R={render:function(){let[e,t]=(0,M.useState)(!1);return(0,j.jsxs)(y,{open:e,onOpenChange:t,children:[(0,j.jsx)(b,{render:(0,j.jsx)(a,{variant:`outline`,children:`Controlled Sheet`})}),(0,j.jsxs)(w,{side:`right`,children:[(0,j.jsxs)(T,{children:[(0,j.jsx)(D,{children:`Controlled Sheet`}),(0,j.jsx)(O,{children:`This sheet is controlled via React state.`})]}),(0,j.jsx)(`div`,{className:`flex-1 px-4`,children:(0,j.jsx)(a,{variant:`outline`,onClick:()=>t(!1),children:`Close Manually`})})]})]})}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet defaultOpen>\r
      <SheetTrigger render={<Button variant="outline">Open Sheet (Right)</Button>} />\r
      <SheetContent side="right">\r
        <SheetHeader>\r
          <SheetTitle>Sheet Title</SheetTitle>\r
          <SheetDescription>\r
            This is a sheet panel that slides in from the right side.\r
          </SheetDescription>\r
        </SheetHeader>\r
        <div className="flex-1 px-4 text-sm text-muted-foreground">\r
          <p>Main content area. Add your form or content here.</p>\r
        </div>\r
        <SheetFooter>\r
          <Button variant="outline">Cancel</Button>\r
          <Button>Save</Button>\r
        </SheetFooter>\r
      </SheetContent>\r
    </Sheet>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet defaultOpen>\r
      <SheetTrigger render={<Button variant="outline">Open Sheet (Left)</Button>} />\r
      <SheetContent side="left">\r
        <SheetHeader>\r
          <SheetTitle>Navigation</SheetTitle>\r
          <SheetDescription>\r
            Slide-in navigation panel from the left side.\r
          </SheetDescription>\r
        </SheetHeader>\r
        <nav className="flex flex-col gap-1 px-4">\r
          {["Dashboard", "Profile", "Settings", "Help"].map(item => <Button key={item} variant="ghost" className="justify-start">\r
              {item}\r
            </Button>)}\r
        </nav>\r
      </SheetContent>\r
    </Sheet>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet defaultOpen>\r
      <SheetTrigger render={<Button variant="outline">Open Sheet (Top)</Button>} />\r
      <SheetContent side="top" className="p-6">\r
        <SheetTitle>Notification Preferences</SheetTitle>\r
        <div className="py-4 text-sm text-muted-foreground">\r
          Configure how you receive notifications.\r
        </div>\r
      </SheetContent>\r
    </Sheet>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet defaultOpen>\r
      <SheetTrigger render={<Button variant="outline">Open Sheet (Bottom)</Button>} />\r
      <SheetContent side="bottom" className="p-6">\r
        <SheetTitle>Quick Actions</SheetTitle>\r
        <div className="mt-4 grid grid-cols-3 gap-3">\r
          {["Share", "Edit", "Delete", "Copy", "Move", "Archive"].map(action => <Button key={action} variant="outline" className="w-full">\r
              {action}\r
            </Button>)}\r
        </div>\r
      </SheetContent>\r
    </Sheet>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [open, setOpen] = useState(false);
    return <Sheet open={open} onOpenChange={setOpen}>\r
        <SheetTrigger render={<Button variant="outline">Controlled Sheet</Button>} />\r
        <SheetContent side="right">\r
          <SheetHeader>\r
            <SheetTitle>Controlled Sheet</SheetTitle>\r
            <SheetDescription>\r
              This sheet is controlled via React state.\r
            </SheetDescription>\r
          </SheetHeader>\r
          <div className="flex-1 px-4">\r
            <Button variant="outline" onClick={() => setOpen(false)}>\r
              Close Manually\r
            </Button>\r
          </div>\r
        </SheetContent>\r
      </Sheet>;
  }
}`,...R.parameters?.docs?.source}}},z=[`Right`,`Left`,`Top`,`Bottom`,`Controlled`]}))();export{L as Bottom,R as Controlled,F as Left,P as Right,I as Top,z as __namedExportsOrder,N as default};