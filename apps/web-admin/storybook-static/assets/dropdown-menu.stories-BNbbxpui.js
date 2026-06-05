import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./button-1uNtGEHO.js";import{a as i,c as a,d as o,f as s,h as c,i as l,l as u,m as d,n as f,o as p,p as m,r as h,s as g,t as _,u as v}from"./dropdown-menu-XjwnHbAz.js";import{Et as y,I as b,P as x,S,c as C,et as w,t as T}from"./lucide-react-C2wKu_9A.js";var E,D,O,k,A,j,M,N;e((()=>{E=t(),T(),c(),n(),D={title:`UI/DropdownMenu`,component:_,parameters:{layout:`centered`},tags:[`autodocs`]},O={render:()=>(0,E.jsxs)(_,{defaultOpen:!0,children:[(0,E.jsx)(d,{render:(0,E.jsx)(r,{variant:`outline`,children:`Open Menu`})}),(0,E.jsxs)(h,{className:`w-48`,children:[(0,E.jsx)(l,{children:(0,E.jsx)(p,{children:`My Account`})}),(0,E.jsx)(u,{}),(0,E.jsxs)(l,{children:[(0,E.jsxs)(i,{children:[(0,E.jsx)(C,{}),`Profile`,(0,E.jsx)(v,{children:`⇧⌘P`})]}),(0,E.jsxs)(i,{children:[(0,E.jsx)(S,{}),`Settings`,(0,E.jsx)(v,{children:`⌘S`})]}),(0,E.jsxs)(i,{children:[(0,E.jsx)(x,{}),`Messages`,(0,E.jsx)(v,{children:`⌘M`})]}),(0,E.jsxs)(i,{children:[(0,E.jsx)(y,{}),`Notifications`]})]}),(0,E.jsx)(u,{}),(0,E.jsxs)(i,{variant:`destructive`,children:[(0,E.jsx)(b,{}),`Log out`,(0,E.jsx)(v,{children:`⇧⌘Q`})]})]})]})},k={render:()=>(0,E.jsxs)(_,{defaultOpen:!0,children:[(0,E.jsx)(d,{render:(0,E.jsx)(r,{variant:`outline`,children:`More Actions`})}),(0,E.jsxs)(h,{className:`w-48`,children:[(0,E.jsx)(i,{children:`New File`}),(0,E.jsx)(i,{children:`New Folder`}),(0,E.jsx)(u,{}),(0,E.jsxs)(o,{children:[(0,E.jsx)(m,{children:`Share`}),(0,E.jsxs)(s,{children:[(0,E.jsx)(i,{children:`Email`}),(0,E.jsx)(i,{children:`Copy Link`}),(0,E.jsx)(i,{children:`Slack`})]})]}),(0,E.jsxs)(o,{children:[(0,E.jsx)(m,{children:`Export`}),(0,E.jsxs)(s,{children:[(0,E.jsx)(i,{children:`PDF`}),(0,E.jsx)(i,{children:`CSV`}),(0,E.jsx)(i,{children:`JSON`})]})]}),(0,E.jsx)(u,{}),(0,E.jsx)(i,{variant:`destructive`,children:`Delete`})]})]})},A={render:()=>(0,E.jsxs)(_,{defaultOpen:!0,children:[(0,E.jsx)(d,{render:(0,E.jsx)(r,{variant:`outline`,children:`Columns`})}),(0,E.jsxs)(h,{className:`w-48`,children:[(0,E.jsxs)(l,{children:[(0,E.jsx)(p,{children:`Visible Columns`}),(0,E.jsx)(f,{defaultChecked:!0,children:`Name`}),(0,E.jsx)(f,{defaultChecked:!0,children:`Email`}),(0,E.jsx)(f,{defaultChecked:!0,children:`Role`}),(0,E.jsx)(f,{children:`Status`}),(0,E.jsx)(f,{children:`Last Login`})]}),(0,E.jsx)(u,{}),(0,E.jsx)(i,{inset:!0,children:`Reset to Default`})]})]})},j={render:()=>(0,E.jsxs)(_,{defaultOpen:!0,children:[(0,E.jsx)(d,{render:(0,E.jsx)(r,{variant:`outline`,children:`Sort By`})}),(0,E.jsx)(h,{className:`w-48`,children:(0,E.jsxs)(g,{defaultValue:`asc`,children:[(0,E.jsx)(p,{children:`Sort Order`}),(0,E.jsx)(a,{value:`asc`,children:`Ascending`}),(0,E.jsx)(a,{value:`desc`,children:`Descending`}),(0,E.jsx)(a,{value:`recent`,children:`Most Recent`})]})})]})},M={render:()=>(0,E.jsxs)(_,{children:[(0,E.jsx)(d,{render:(0,E.jsx)(r,{variant:`ghost`,size:`icon`,children:(0,E.jsx)(w,{})})}),(0,E.jsxs)(h,{align:`end`,className:`w-48`,children:[(0,E.jsx)(i,{children:`Edit`}),(0,E.jsx)(i,{children:`Duplicate`}),(0,E.jsx)(u,{}),(0,E.jsx)(i,{variant:`destructive`,children:`Delete`})]})]})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu defaultOpen>\r
      <DropdownMenuTrigger render={<Button variant="outline">Open Menu</Button>} />\r
      <DropdownMenuContent className="w-48">\r
        <DropdownMenuGroup>\r
          <DropdownMenuLabel>My Account</DropdownMenuLabel>\r
        </DropdownMenuGroup>\r
        <DropdownMenuSeparator />\r
        <DropdownMenuGroup>\r
          <DropdownMenuItem>\r
            <UserIcon />\r
            Profile\r
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>\r
          </DropdownMenuItem>\r
          <DropdownMenuItem>\r
            <SettingsIcon />\r
            Settings\r
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>\r
          </DropdownMenuItem>\r
          <DropdownMenuItem>\r
            <MailIcon />\r
            Messages\r
            <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>\r
          </DropdownMenuItem>\r
          <DropdownMenuItem>\r
            <BellIcon />\r
            Notifications\r
          </DropdownMenuItem>\r
        </DropdownMenuGroup>\r
        <DropdownMenuSeparator />\r
        <DropdownMenuItem variant="destructive">\r
          <LogOutIcon />\r
          Log out\r
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>\r
        </DropdownMenuItem>\r
      </DropdownMenuContent>\r
    </DropdownMenu>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu defaultOpen>\r
      <DropdownMenuTrigger render={<Button variant="outline">More Actions</Button>} />\r
      <DropdownMenuContent className="w-48">\r
        <DropdownMenuItem>New File</DropdownMenuItem>\r
        <DropdownMenuItem>New Folder</DropdownMenuItem>\r
        <DropdownMenuSeparator />\r
        <DropdownMenuSub>\r
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>\r
          <DropdownMenuSubContent>\r
            <DropdownMenuItem>Email</DropdownMenuItem>\r
            <DropdownMenuItem>Copy Link</DropdownMenuItem>\r
            <DropdownMenuItem>Slack</DropdownMenuItem>\r
          </DropdownMenuSubContent>\r
        </DropdownMenuSub>\r
        <DropdownMenuSub>\r
          <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>\r
          <DropdownMenuSubContent>\r
            <DropdownMenuItem>PDF</DropdownMenuItem>\r
            <DropdownMenuItem>CSV</DropdownMenuItem>\r
            <DropdownMenuItem>JSON</DropdownMenuItem>\r
          </DropdownMenuSubContent>\r
        </DropdownMenuSub>\r
        <DropdownMenuSeparator />\r
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>\r
      </DropdownMenuContent>\r
    </DropdownMenu>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu defaultOpen>\r
      <DropdownMenuTrigger render={<Button variant="outline">Columns</Button>} />\r
      <DropdownMenuContent className="w-48">\r
        <DropdownMenuGroup>\r
          <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>\r
          <DropdownMenuCheckboxItem defaultChecked>Name</DropdownMenuCheckboxItem>\r
        <DropdownMenuCheckboxItem defaultChecked>Email</DropdownMenuCheckboxItem>\r
        <DropdownMenuCheckboxItem defaultChecked>Role</DropdownMenuCheckboxItem>\r
        <DropdownMenuCheckboxItem>Status</DropdownMenuCheckboxItem>\r
        <DropdownMenuCheckboxItem>Last Login</DropdownMenuCheckboxItem>\r
        </DropdownMenuGroup>\r
        <DropdownMenuSeparator />\r
        <DropdownMenuItem inset>Reset to Default</DropdownMenuItem>\r
      </DropdownMenuContent>\r
    </DropdownMenu>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu defaultOpen>\r
      <DropdownMenuTrigger render={<Button variant="outline">Sort By</Button>} />\r
      <DropdownMenuContent className="w-48">\r
        <DropdownMenuRadioGroup defaultValue="asc">\r
          <DropdownMenuLabel>Sort Order</DropdownMenuLabel>\r
          <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>\r
          <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>\r
          <DropdownMenuRadioItem value="recent">Most Recent</DropdownMenuRadioItem>\r
        </DropdownMenuRadioGroup>\r
      </DropdownMenuContent>\r
    </DropdownMenu>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>\r
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon">\r
            <MoreHorizontalIcon />\r
          </Button>} />\r
      <DropdownMenuContent align="end" className="w-48">\r
        <DropdownMenuItem>Edit</DropdownMenuItem>\r
        <DropdownMenuItem>Duplicate</DropdownMenuItem>\r
        <DropdownMenuSeparator />\r
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>\r
      </DropdownMenuContent>\r
    </DropdownMenu>
}`,...M.parameters?.docs?.source}}},N=[`Default`,`WithSubmenu`,`CheckboxItems`,`RadioItems`,`IconButton`]}))();export{A as CheckboxItems,O as Default,M as IconButton,j as RadioItems,k as WithSubmenu,N as __namedExportsOrder,D as default};