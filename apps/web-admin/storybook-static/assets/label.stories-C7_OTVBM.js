import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./label-DA9PpvsN.js";import{n as i,t as a}from"./input-CrkgdOxh.js";var o,s,c,l,u,d,f,p,m;e((()=>{o=t(),n(),i(),s={title:`UI/Label`,component:r,parameters:{layout:`centered`},tags:[`autodocs`]},c={args:{children:`Nama Lengkap`}},l={render:()=>(0,o.jsxs)(`div`,{className:`grid w-[300px] gap-2`,children:[(0,o.jsx)(r,{htmlFor:`name`,children:`Nama Lengkap`}),(0,o.jsx)(a,{id:`name`,placeholder:`Masukkan nama`})]})},u={render:()=>(0,o.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,o.jsx)(r,{children:`Email`}),(0,o.jsx)(`span`,{className:`text-sm text-destructive`,children:`*`})]})},d={render:()=>(0,o.jsxs)(`div`,{className:`group grid w-[300px] gap-2`,"data-disabled":`true`,children:[(0,o.jsx)(r,{htmlFor:`disabled-input`,children:`Disabled Field`}),(0,o.jsx)(a,{id:`disabled-input`,disabled:!0,placeholder:`Tidak bisa diisi`})]})},f={render:()=>(0,o.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,o.jsx)(`input`,{type:`checkbox`,id:`terms`,className:`size-4`}),(0,o.jsx)(r,{htmlFor:`terms`,children:`Accept terms and conditions`})]})},p={render:()=>(0,o.jsxs)(`div`,{className:`grid w-[300px] gap-4`,children:[(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`field-1`,children:`Field 1`}),(0,o.jsx)(a,{id:`field-1`,placeholder:`First field`})]}),(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`field-2`,children:`Field 2`}),(0,o.jsx)(a,{id:`field-2`,placeholder:`Second field`})]}),(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`field-3`,children:`Field 3`}),(0,o.jsx)(a,{id:`field-3`,placeholder:`Third field`})]})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Nama Lengkap"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[300px] gap-2">\r
      <Label htmlFor="name">Nama Lengkap</Label>\r
      <Input id="name" placeholder="Masukkan nama" />\r
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-1">\r
      <Label>Email</Label>\r
      <span className="text-sm text-destructive">*</span>\r
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="group grid w-[300px] gap-2" data-disabled="true">\r
      <Label htmlFor="disabled-input">\r
        Disabled Field\r
      </Label>\r
      <Input id="disabled-input" disabled placeholder="Tidak bisa diisi" />\r
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2">\r
      <input type="checkbox" id="terms" className="size-4" />\r
      <Label htmlFor="terms">Accept terms and conditions</Label>\r
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[300px] gap-4">\r
      <div className="grid gap-2">\r
        <Label htmlFor="field-1">Field 1</Label>\r
        <Input id="field-1" placeholder="First field" />\r
      </div>\r
      <div className="grid gap-2">\r
        <Label htmlFor="field-2">Field 2</Label>\r
        <Input id="field-2" placeholder="Second field" />\r
      </div>\r
      <div className="grid gap-2">\r
        <Label htmlFor="field-3">Field 3</Label>\r
        <Input id="field-3" placeholder="Third field" />\r
      </div>\r
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Default`,`WithInput`,`Required`,`Disabled`,`WithCheckbox`,`MultipleLabels`]}))();export{c as Default,d as Disabled,p as MultipleLabels,u as Required,f as WithCheckbox,l as WithInput,m as __namedExportsOrder,s as default};