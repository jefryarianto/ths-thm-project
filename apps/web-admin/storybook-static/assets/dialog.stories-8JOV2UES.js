import{c as e,i as t}from"./preload-helper-D2yxXLVK.js";import{$ as n,j as r}from"./iframe-Cx3N5IyB.js";import{n as i,t as a}from"./button-1uNtGEHO.js";import{n as o,t as s}from"./utils-CMVnEVHk.js";import{n as c,t as l}from"./lucide-react-C2wKu_9A.js";import{n as u,t as d}from"./label-DA9PpvsN.js";import{c as f,f as p,g as m,i as h,m as g,n as _,o as v,t as y,u as b}from"./dialog-ByXXrODD.js";import{n as x,t as S}from"./textarea--20W1Yqv.js";function C({...e}){return(0,N.jsx)(v,{"data-slot":`dialog`,...e})}function w({...e}){return(0,N.jsx)(_,{"data-slot":`dialog-trigger`,...e})}function T({...e}){return(0,N.jsx)(f,{"data-slot":`dialog-portal`,...e})}function E({...e}){return(0,N.jsx)(g,{"data-slot":`dialog-close`,...e})}function D({className:e,...t}){return(0,N.jsx)(m,{"data-slot":`dialog-overlay`,className:s(`fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0`,e),...t})}function O({className:e,children:t,showCloseButton:n=!0,...r}){return(0,N.jsxs)(T,{children:[(0,N.jsx)(D,{}),(0,N.jsxs)(b,{"data-slot":`dialog-content`,className:s(`fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,e),...r,children:[t,n&&(0,N.jsxs)(g,{"data-slot":`dialog-close`,render:(0,N.jsx)(a,{variant:`ghost`,className:`absolute top-2 right-2`,size:`icon-sm`}),children:[(0,N.jsx)(c,{}),(0,N.jsx)(`span`,{className:`sr-only`,children:`Close`})]})]})]})}function k({className:e,...t}){return(0,N.jsx)(`div`,{"data-slot":`dialog-header`,className:s(`flex flex-col gap-2`,e),...t})}function A({className:e,showCloseButton:t=!1,children:n,...r}){return(0,N.jsxs)(`div`,{"data-slot":`dialog-footer`,className:s(`-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end`,e),...r,children:[n,t&&(0,N.jsx)(g,{render:(0,N.jsx)(a,{variant:`outline`}),children:`Close`})]})}function j({className:e,...t}){return(0,N.jsx)(h,{"data-slot":`dialog-title`,className:s(`text-base leading-none font-medium`,e),...t})}function M({className:e,...t}){return(0,N.jsx)(p,{"data-slot":`dialog-description`,className:s(`text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground`,e),...t})}var N,P=t((()=>{N=r(),y(),o(),i(),l(),C.__docgenInfo={description:``,methods:[],displayName:`Dialog`},E.__docgenInfo={description:``,methods:[],displayName:`DialogClose`},O.__docgenInfo={description:``,methods:[],displayName:`DialogContent`,props:{showCloseButton:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`true`,computed:!1}}}},M.__docgenInfo={description:``,methods:[],displayName:`DialogDescription`},A.__docgenInfo={description:``,methods:[],displayName:`DialogFooter`,props:{showCloseButton:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}},k.__docgenInfo={description:``,methods:[],displayName:`DialogHeader`},D.__docgenInfo={description:``,methods:[],displayName:`DialogOverlay`},T.__docgenInfo={description:``,methods:[],displayName:`DialogPortal`},j.__docgenInfo={description:``,methods:[],displayName:`DialogTitle`},w.__docgenInfo={description:``,methods:[],displayName:`DialogTrigger`}})),F,I,L,R,z,B,V,H,U,W;t((()=>{F=r(),I=e(n()),P(),i(),u(),x(),L={title:`UI/Dialog`,component:C,parameters:{layout:`centered`},tags:[`autodocs`]},R={render:()=>(0,F.jsxs)(C,{defaultOpen:!0,children:[(0,F.jsx)(w,{render:(0,F.jsx)(a,{variant:`outline`,children:`Open Dialog`})}),(0,F.jsxs)(O,{children:[(0,F.jsxs)(k,{children:[(0,F.jsx)(j,{children:`Dialog Title`}),(0,F.jsx)(M,{children:`This is a dialog description. You can put any content here.`})]}),(0,F.jsx)(`div`,{className:`py-4 text-sm text-muted-foreground`,children:`This is the main content area of the dialog. You can put forms, text, or any other content here.`}),(0,F.jsxs)(A,{showCloseButton:!0,children:[(0,F.jsx)(a,{variant:`outline`,children:`Cancel`}),(0,F.jsx)(a,{children:`Save`})]})]})]})},z={render:()=>(0,F.jsxs)(C,{defaultOpen:!0,children:[(0,F.jsx)(w,{render:(0,F.jsx)(a,{variant:`outline`,children:`Open Dialog`})}),(0,F.jsxs)(O,{children:[(0,F.jsx)(k,{children:(0,F.jsx)(j,{children:`Delete Item`})}),(0,F.jsx)(`div`,{className:`py-4 text-sm text-muted-foreground`,children:`Are you sure you want to delete this item? This action cannot be undone.`}),(0,F.jsxs)(A,{showCloseButton:!0,className:`flex-row justify-end gap-2`,children:[(0,F.jsx)(a,{variant:`outline`,children:`Cancel`}),(0,F.jsx)(a,{variant:`destructive`,children:`Delete`})]})]})]})},B={render:()=>(0,F.jsxs)(C,{defaultOpen:!0,children:[(0,F.jsx)(w,{render:(0,F.jsx)(a,{variant:`outline`,children:`Open Dialog`})}),(0,F.jsxs)(O,{className:`sm:max-w-lg`,children:[(0,F.jsxs)(k,{children:[(0,F.jsx)(j,{children:`Terms of Service`}),(0,F.jsx)(M,{children:`Please read the following terms carefully.`})]}),(0,F.jsx)(`div`,{className:`max-h-60 space-y-4 overflow-y-auto py-4 text-sm text-muted-foreground`,children:Array.from({length:5},(e,t)=>(0,F.jsxs)(`p`,{children:[`Section `,t+1,`: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`]},t))}),(0,F.jsx)(A,{showCloseButton:!0,children:(0,F.jsx)(a,{children:`Accept`})})]})]})},V={render:function(){let[e,t]=(0,I.useState)(!1);return(0,F.jsxs)(C,{open:e,onOpenChange:t,children:[(0,F.jsx)(w,{render:(0,F.jsx)(a,{variant:`outline`,children:`Controlled Dialog`})}),(0,F.jsxs)(O,{children:[(0,F.jsxs)(k,{children:[(0,F.jsx)(j,{children:`Controlled Dialog`}),(0,F.jsx)(M,{children:`This dialog is controlled via React state. Click outside or press Escape to close.`})]}),(0,F.jsx)(`div`,{className:`py-4`,children:(0,F.jsx)(a,{variant:`outline`,onClick:()=>t(!1),children:`Close Manually`})})]})]})}},H={render:()=>(0,F.jsxs)(C,{defaultOpen:!0,children:[(0,F.jsx)(w,{render:(0,F.jsx)(a,{variant:`outline`,children:`Edit Profile`})}),(0,F.jsxs)(O,{className:`sm:max-w-md`,children:[(0,F.jsxs)(k,{children:[(0,F.jsx)(j,{children:`Edit Profile`}),(0,F.jsx)(M,{children:`Make changes to your profile information here.`})]}),(0,F.jsxs)(`div`,{className:`space-y-4 py-2`,children:[(0,F.jsxs)(`div`,{className:`space-y-2`,children:[(0,F.jsx)(d,{htmlFor:`dialog-name`,children:`Name`}),(0,F.jsx)(`div`,{className:`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm`,id:`dialog-name`,children:`John Doe`})]}),(0,F.jsxs)(`div`,{className:`space-y-2`,children:[(0,F.jsx)(d,{htmlFor:`dialog-email`,children:`Email`}),(0,F.jsx)(`div`,{className:`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm`,id:`dialog-email`,children:`john@example.com`})]}),(0,F.jsxs)(`div`,{className:`space-y-2`,children:[(0,F.jsx)(d,{htmlFor:`dialog-bio`,children:`Bio`}),(0,F.jsx)(S,{id:`dialog-bio`,defaultValue:`Full-stack developer passionate about UI/UX.`,rows:3})]})]}),(0,F.jsxs)(A,{showCloseButton:!0,children:[(0,F.jsx)(a,{variant:`outline`,children:`Cancel`}),(0,F.jsx)(a,{children:`Save Changes`})]})]})]})},U={render:function(){let[e,t]=(0,I.useState)(!1),[n,r]=(0,I.useState)(!1);return n?(0,F.jsxs)(`div`,{className:`flex flex-col items-center gap-3`,children:[(0,F.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Item has been deleted.`}),(0,F.jsx)(a,{variant:`outline`,onClick:()=>r(!1),children:`Reset`})]}):(0,F.jsxs)(C,{defaultOpen:!0,children:[(0,F.jsx)(w,{render:(0,F.jsx)(a,{variant:`destructive`,children:`Delete Item`})}),(0,F.jsxs)(O,{children:[(0,F.jsxs)(k,{children:[(0,F.jsx)(j,{children:`Confirm Deletion`}),(0,F.jsx)(M,{children:`This action cannot be undone. This will permanently delete the selected item and remove all associated data.`})]}),(0,F.jsxs)(`div`,{className:`rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive`,children:[(0,F.jsx)(`p`,{className:`font-medium`,children:`Warning`}),(0,F.jsx)(`p`,{className:`mt-1 text-destructive/80`,children:`Deleted data cannot be recovered. Make sure you have a backup if needed.`})]}),(0,F.jsxs)(A,{showCloseButton:!0,children:[(0,F.jsx)(a,{variant:`outline`,disabled:e,children:`Cancel`}),(0,F.jsx)(a,{variant:`destructive`,disabled:e,onClick:()=>{t(!0),setTimeout(()=>{t(!1),r(!0)},1500)},children:e?`Deleting...`:`Delete`})]})]})]})}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>\r
      <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />\r
      <DialogContent>\r
        <DialogHeader>\r
          <DialogTitle>Dialog Title</DialogTitle>\r
          <DialogDescription>\r
            This is a dialog description. You can put any content here.\r
          </DialogDescription>\r
        </DialogHeader>\r
        <div className="py-4 text-sm text-muted-foreground">\r
          This is the main content area of the dialog. You can put forms, text, or any other content here.\r
        </div>\r
        <DialogFooter showCloseButton>\r
          <Button variant="outline">Cancel</Button>\r
          <Button>Save</Button>\r
        </DialogFooter>\r
      </DialogContent>\r
    </Dialog>
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>\r
      <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />\r
      <DialogContent>\r
        <DialogHeader>\r
          <DialogTitle>Delete Item</DialogTitle>\r
        </DialogHeader>\r
        <div className="py-4 text-sm text-muted-foreground">\r
          Are you sure you want to delete this item? This action cannot be undone.\r
        </div>\r
        <DialogFooter showCloseButton className="flex-row justify-end gap-2">\r
          <Button variant="outline">Cancel</Button>\r
          <Button variant="destructive">Delete</Button>\r
        </DialogFooter>\r
      </DialogContent>\r
    </Dialog>
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>\r
      <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />\r
      <DialogContent className="sm:max-w-lg">\r
        <DialogHeader>\r
          <DialogTitle>Terms of Service</DialogTitle>\r
          <DialogDescription>\r
            Please read the following terms carefully.\r
          </DialogDescription>\r
        </DialogHeader>\r
        <div className="max-h-60 space-y-4 overflow-y-auto py-4 text-sm text-muted-foreground">\r
          {Array.from({
          length: 5
        }, (_, i) => <p key={i}>\r
              Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\r
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi\r
              ut aliquip ex ea commodo consequat.\r
            </p>)}\r
        </div>\r
        <DialogFooter showCloseButton>\r
          <Button>Accept</Button>\r
        </DialogFooter>\r
      </DialogContent>\r
    </Dialog>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [open, setOpen] = useState(false);
    return <Dialog open={open} onOpenChange={setOpen}>\r
        <DialogTrigger render={<Button variant="outline">Controlled Dialog</Button>} />\r
        <DialogContent>\r
          <DialogHeader>\r
            <DialogTitle>Controlled Dialog</DialogTitle>\r
            <DialogDescription>\r
              This dialog is controlled via React state. Click outside or press Escape to close.\r
            </DialogDescription>\r
          </DialogHeader>\r
          <div className="py-4">\r
            <Button variant="outline" onClick={() => setOpen(false)}>\r
              Close Manually\r
            </Button>\r
          </div>\r
        </DialogContent>\r
      </Dialog>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>\r
      <DialogTrigger render={<Button variant="outline">Edit Profile</Button>} />\r
      <DialogContent className="sm:max-w-md">\r
        <DialogHeader>\r
          <DialogTitle>Edit Profile</DialogTitle>\r
          <DialogDescription>\r
            Make changes to your profile information here.\r
          </DialogDescription>\r
        </DialogHeader>\r
        <div className="space-y-4 py-2">\r
          <div className="space-y-2">\r
            <Label htmlFor="dialog-name">Name</Label>\r
            <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm" id="dialog-name">\r
              John Doe\r
            </div>\r
          </div>\r
          <div className="space-y-2">\r
            <Label htmlFor="dialog-email">Email</Label>\r
            <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm" id="dialog-email">\r
              john@example.com\r
            </div>\r
          </div>\r
          <div className="space-y-2">\r
            <Label htmlFor="dialog-bio">Bio</Label>\r
            <Textarea id="dialog-bio" defaultValue="Full-stack developer passionate about UI/UX." rows={3} />\r
          </div>\r
        </div>\r
        <DialogFooter showCloseButton>\r
          <Button variant="outline">Cancel</Button>\r
          <Button>Save Changes</Button>\r
        </DialogFooter>\r
      </DialogContent>\r
    </Dialog>
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    if (confirmed) {
      return <div className="flex flex-col items-center gap-3">\r
          <p className="text-sm text-muted-foreground">Item has been deleted.</p>\r
          <Button variant="outline" onClick={() => setConfirmed(false)}>Reset</Button>\r
        </div>;
    }
    return <Dialog defaultOpen>\r
        <DialogTrigger render={<Button variant="destructive">Delete Item</Button>} />\r
        <DialogContent>\r
          <DialogHeader>\r
            <DialogTitle>Confirm Deletion</DialogTitle>\r
            <DialogDescription>\r
              This action cannot be undone. This will permanently delete the selected item\r
              and remove all associated data.\r
            </DialogDescription>\r
          </DialogHeader>\r
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">\r
            <p className="font-medium">Warning</p>\r
            <p className="mt-1 text-destructive/80">\r
              Deleted data cannot be recovered. Make sure you have a backup if needed.\r
            </p>\r
          </div>\r
          <DialogFooter showCloseButton>\r
            <Button variant="outline" disabled={loading}>Cancel</Button>\r
            <Button variant="destructive" disabled={loading} onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setConfirmed(true);
            }, 1500);
          }}>\r
              {loading ? "Deleting..." : "Delete"}\r
            </Button>\r
          </DialogFooter>\r
        </DialogContent>\r
      </Dialog>;
  }
}`,...U.parameters?.docs?.source}}},W=[`Default`,`WithoutDescription`,`LongContent`,`Controlled`,`WithForm`,`DestructiveConfirm`]}))();export{V as Controlled,R as Default,U as DestructiveConfirm,B as LongContent,H as WithForm,z as WithoutDescription,W as __namedExportsOrder,L as default};