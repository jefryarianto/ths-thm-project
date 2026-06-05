import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./button-1uNtGEHO.js";import{S as i,t as a}from"./lucide-react-C2wKu_9A.js";import{a as o,c as s,i as c,n as l,o as u,r as d,s as f,t as p}from"./card-DI3aVoKc.js";var m,h,g,_,v,y,b,x,S;e((()=>{m=t(),s(),n(),a(),h={title:`UI/Card`,component:p,parameters:{layout:`centered`},tags:[`autodocs`]},g={render:()=>(0,m.jsxs)(p,{className:`w-[350px]`,children:[(0,m.jsxs)(u,{children:[(0,m.jsx)(f,{children:`Card Title`}),(0,m.jsx)(c,{children:`Card description goes here.`})]}),(0,m.jsx)(d,{children:(0,m.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`This is the main content area of the card. You can put any content here.`})}),(0,m.jsxs)(o,{children:[(0,m.jsx)(r,{variant:`outline`,children:`Cancel`}),(0,m.jsx)(r,{className:`ml-auto`,children:`Save`})]})]})},_={render:()=>(0,m.jsxs)(p,{className:`w-[350px]`,children:[(0,m.jsxs)(u,{children:[(0,m.jsx)(f,{children:`Notifications`}),(0,m.jsx)(c,{children:`Manage your notification preferences.`}),(0,m.jsx)(l,{children:(0,m.jsx)(r,{size:`icon-sm`,variant:`ghost`,children:(0,m.jsx)(i,{})})})]}),(0,m.jsx)(d,{children:(0,m.jsx)(`div`,{className:`space-y-3`,children:[`Email`,`Push`,`SMS`].map(e=>(0,m.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,m.jsx)(`span`,{className:`text-sm`,children:e}),(0,m.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Enabled`})]},e))})})]})},v={render:()=>(0,m.jsxs)(p,{size:`sm`,className:`w-[300px]`,children:[(0,m.jsx)(u,{children:(0,m.jsx)(f,{children:`Quick Stats`})}),(0,m.jsx)(d,{children:(0,m.jsx)(`div`,{className:`grid grid-cols-2 gap-3`,children:[{label:`Total`,value:`128`},{label:`Active`,value:`94`},{label:`Pending`,value:`23`},{label:`Archived`,value:`11`}].map(e=>(0,m.jsxs)(`div`,{className:`rounded-lg bg-muted p-2 text-center`,children:[(0,m.jsx)(`div`,{className:`text-lg font-bold`,children:e.value}),(0,m.jsx)(`div`,{className:`text-xs text-muted-foreground`,children:e.label})]},e.label))})})]})},y={render:()=>(0,m.jsx)(p,{className:`w-[350px]`,children:(0,m.jsx)(d,{children:(0,m.jsx)(`p`,{className:`text-sm`,children:`A simple card with just content, no header or footer.`})})})},b={render:()=>(0,m.jsxs)(p,{className:`w-[380px]`,children:[(0,m.jsxs)(u,{children:[(0,m.jsx)(f,{children:`Edit Profile`}),(0,m.jsx)(c,{children:`Make changes to your profile information.`})]}),(0,m.jsxs)(d,{className:`space-y-3`,children:[(0,m.jsxs)(`div`,{className:`space-y-1`,children:[(0,m.jsx)(`label`,{className:`text-sm font-medium`,children:`Name`}),(0,m.jsx)(`div`,{className:`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm`,children:`John Doe`})]}),(0,m.jsxs)(`div`,{className:`space-y-1`,children:[(0,m.jsx)(`label`,{className:`text-sm font-medium`,children:`Email`}),(0,m.jsx)(`div`,{className:`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm`,children:`john@example.com`})]})]}),(0,m.jsxs)(o,{className:`justify-end gap-2`,children:[(0,m.jsx)(r,{variant:`outline`,children:`Cancel`}),(0,m.jsx)(r,{children:`Save Changes`})]})]})},x={name:`Mobile`,parameters:{viewport:{defaultViewport:`mobile`},layout:`fullscreen`},render:()=>(0,m.jsxs)(p,{className:`mx-auto mt-4 w-[calc(100%-32px)] max-w-sm`,children:[(0,m.jsx)(u,{children:(0,m.jsx)(f,{children:`Quick Stats`})}),(0,m.jsx)(d,{children:(0,m.jsx)(`div`,{className:`grid grid-cols-2 gap-3`,children:[{label:`Total`,value:`128`},{label:`Active`,value:`94`},{label:`Pending`,value:`23`},{label:`Archived`,value:`11`}].map(e=>(0,m.jsxs)(`div`,{className:`rounded-lg bg-muted p-2 text-center`,children:[(0,m.jsx)(`div`,{className:`text-lg font-bold`,children:e.value}),(0,m.jsx)(`div`,{className:`text-xs text-muted-foreground`,children:e.label})]},e.label))})})]})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardHeader>\r
        <CardTitle>Card Title</CardTitle>\r
        <CardDescription>Card description goes here.</CardDescription>\r
      </CardHeader>\r
      <CardContent>\r
        <p className="text-sm text-muted-foreground">\r
          This is the main content area of the card. You can put any content here.\r
        </p>\r
      </CardContent>\r
      <CardFooter>\r
        <Button variant="outline">Cancel</Button>\r
        <Button className="ml-auto">Save</Button>\r
      </CardFooter>\r
    </Card>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardHeader>\r
        <CardTitle>Notifications</CardTitle>\r
        <CardDescription>Manage your notification preferences.</CardDescription>\r
        <CardAction>\r
          <Button size="icon-sm" variant="ghost">\r
            <SettingsIcon />\r
          </Button>\r
        </CardAction>\r
      </CardHeader>\r
      <CardContent>\r
        <div className="space-y-3">\r
          {["Email", "Push", "SMS"].map(item => <div key={item} className="flex items-center justify-between">\r
              <span className="text-sm">{item}</span>\r
              <span className="text-xs text-muted-foreground">Enabled</span>\r
            </div>)}\r
        </div>\r
      </CardContent>\r
    </Card>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Card size="sm" className="w-[300px]">\r
      <CardHeader>\r
        <CardTitle>Quick Stats</CardTitle>\r
      </CardHeader>\r
      <CardContent>\r
        <div className="grid grid-cols-2 gap-3">\r
          {[{
          label: "Total",
          value: "128"
        }, {
          label: "Active",
          value: "94"
        }, {
          label: "Pending",
          value: "23"
        }, {
          label: "Archived",
          value: "11"
        }].map(stat => <div key={stat.label} className="rounded-lg bg-muted p-2 text-center">\r
              <div className="text-lg font-bold">{stat.value}</div>\r
              <div className="text-xs text-muted-foreground">{stat.label}</div>\r
            </div>)}\r
        </div>\r
      </CardContent>\r
    </Card>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardContent>\r
        <p className="text-sm">\r
          A simple card with just content, no header or footer.\r
        </p>\r
      </CardContent>\r
    </Card>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[380px]">\r
      <CardHeader>\r
        <CardTitle>Edit Profile</CardTitle>\r
        <CardDescription>\r
          Make changes to your profile information.\r
        </CardDescription>\r
      </CardHeader>\r
      <CardContent className="space-y-3">\r
        <div className="space-y-1">\r
          <label className="text-sm font-medium">Name</label>\r
          <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">\r
            John Doe\r
          </div>\r
        </div>\r
        <div className="space-y-1">\r
          <label className="text-sm font-medium">Email</label>\r
          <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">\r
            john@example.com\r
          </div>\r
        </div>\r
      </CardContent>\r
      <CardFooter className="justify-end gap-2">\r
        <Button variant="outline">Cancel</Button>\r
        <Button>Save Changes</Button>\r
      </CardFooter>\r
    </Card>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Mobile",
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    },
    layout: "fullscreen"
  },
  render: () => <Card className="mx-auto mt-4 w-[calc(100%-32px)] max-w-sm">\r
      <CardHeader>\r
        <CardTitle>Quick Stats</CardTitle>\r
      </CardHeader>\r
      <CardContent>\r
        <div className="grid grid-cols-2 gap-3">\r
          {[{
          label: "Total",
          value: "128"
        }, {
          label: "Active",
          value: "94"
        }, {
          label: "Pending",
          value: "23"
        }, {
          label: "Archived",
          value: "11"
        }].map(stat => <div key={stat.label} className="rounded-lg bg-muted p-2 text-center">\r
              <div className="text-lg font-bold">{stat.value}</div>\r
              <div className="text-xs text-muted-foreground">{stat.label}</div>\r
            </div>)}\r
        </div>\r
      </CardContent>\r
    </Card>
}`,...x.parameters?.docs?.source},description:{story:`Mobile viewport — card dengan layar penuh`,...x.parameters?.docs?.description}}},S=[`Default`,`WithAction`,`Small`,`OnlyContent`,`CompleteExample`,`OnMobile`]}))();export{b as CompleteExample,g as Default,x as OnMobile,y as OnlyContent,v as Small,_ as WithAction,S as __namedExportsOrder,h as default};