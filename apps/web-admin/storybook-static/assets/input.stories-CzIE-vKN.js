import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./input-CrkgdOxh.js";var i,a,o,s,c,l,u,d,f,p,m;e((()=>{i=t(),n(),a={title:`UI/Input`,component:r,parameters:{layout:`centered`},tags:[`autodocs`],argTypes:{type:{control:`select`,options:[`text`,`email`,`password`,`number`,`tel`,`url`,`date`,`search`]},placeholder:{control:`text`},disabled:{control:`boolean`}}},o={args:{placeholder:`Enter text...`}},s={args:{defaultValue:`Sample text value`}},c={args:{type:`email`,placeholder:`email@example.com`}},l={args:{type:`password`,placeholder:`Enter password`,defaultValue:`password123`}},u={args:{type:`number`,placeholder:`0`}},d={args:{type:`date`}},f={args:{placeholder:`Disabled input`,disabled:!0}},p={render:()=>(0,i.jsxs)(`div`,{className:`flex w-[300px] flex-col gap-3`,children:[(0,i.jsx)(r,{placeholder:`Nama lengkap`}),(0,i.jsx)(r,{placeholder:`Email`,type:`email`}),(0,i.jsx)(r,{placeholder:`Password`,type:`password`}),(0,i.jsx)(r,{placeholder:`Search...`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter text..."
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "Sample text value"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    type: "email",
    placeholder: "email@example.com"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: "password",
    placeholder: "Enter password",
    defaultValue: "password123"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    type: "number",
    placeholder: "0"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    type: "date"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Disabled input",
    disabled: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-[300px] flex-col gap-3">\r
      <Input placeholder="Nama lengkap" />\r
      <Input placeholder="Email" type="email" />\r
      <Input placeholder="Password" type="password" />\r
      <Input placeholder="Search..." />\r
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Default`,`WithValue`,`Email`,`Password`,`Number`,`Date`,`Disabled`,`WithPlaceholder`]}))();export{d as Date,o as Default,f as Disabled,c as Email,u as Number,l as Password,p as WithPlaceholder,s as WithValue,m as __namedExportsOrder,a as default};