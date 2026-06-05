import{i as e}from"./preload-helper-D2yxXLVK.js";import{M as t,P as n,c as r,j as i,n as a,o,s,t as c}from"./iframe-Cx3N5IyB.js";import{n as l,t as u}from"./button-1uNtGEHO.js";import{r as d,s as f,t as p}from"./avatar-BLpXBxD7.js";import{a as m,h,i as g,l as _,m as v,o as y,r as b,t as x}from"./dropdown-menu-XjwnHbAz.js";import{A as S,I as C,S as w,c as T,t as E,v as D}from"./lucide-react-C2wKu_9A.js";import{n as O,t as k}from"./notification-bell-9ROucKO5.js";import{n as A,r as j,t as M}from"./dist-d3VYio5a.js";function N(){let{user:e,logout:t}=a(),{theme:i,setTheme:o}=r(),s=n(),c=e?.username?e.username.slice(0,2).toUpperCase():`??`;return(0,P.jsxs)(`header`,{className:`flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6`,children:[(0,P.jsx)(`div`,{}),(0,P.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,P.jsx)(k,{}),(0,P.jsxs)(u,{variant:`ghost`,size:`icon`,onClick:()=>o(i===`dark`?`light`:`dark`),className:`h-9 w-9`,children:[(0,P.jsx)(D,{className:`h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}),(0,P.jsx)(S,{className:`absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}),(0,P.jsx)(`span`,{className:`sr-only`,children:`Toggle theme`})]}),(0,P.jsxs)(x,{children:[(0,P.jsx)(v,{render:(0,P.jsx)(`button`,{className:`relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`,"aria-label":`Menu pengguna`}),children:(0,P.jsx)(p,{className:`h-9 w-9`,children:(0,P.jsx)(d,{className:`text-xs`,children:c})})}),(0,P.jsxs)(b,{className:`w-56`,align:`end`,children:[(0,P.jsx)(g,{children:(0,P.jsx)(y,{className:`font-normal`,children:(0,P.jsxs)(`div`,{className:`flex flex-col space-y-1`,children:[(0,P.jsx)(`p`,{className:`text-sm font-medium leading-none`,children:e?.username||`User`}),(0,P.jsx)(`p`,{className:`text-xs leading-none text-muted-foreground`,children:e?.email||e?.nomorHp||``})]})})}),(0,P.jsx)(_,{}),(0,P.jsxs)(g,{children:[(0,P.jsxs)(m,{children:[(0,P.jsx)(T,{className:`mr-2 h-4 w-4`}),(0,P.jsx)(`span`,{children:`Profil`})]}),(0,P.jsxs)(m,{children:[(0,P.jsx)(w,{className:`mr-2 h-4 w-4`}),(0,P.jsx)(`span`,{children:`Pengaturan`})]})]}),(0,P.jsx)(_,{}),(0,P.jsx)(g,{children:(0,P.jsxs)(m,{onClick:async()=>{await t(),s.push(`/login`)},className:`text-destructive`,children:[(0,P.jsx)(C,{className:`mr-2 h-4 w-4`}),(0,P.jsx)(`span`,{children:`Keluar`})]})})]})]})]})]})}var P,F=e((()=>{P=i(),t(),c(),l(),f(),h(),O(),s(),E(),N.__docgenInfo={description:``,methods:[],displayName:`Header`}})),I,L,R,z,B,V,H,U;e((()=>{I=i(),F(),s(),M(),L={title:`Layout/Header`,component:N,tags:[`autodocs`],parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}},layout:`fullscreen`,docs:{description:{component:`Header utama aplikasi THS THM Admin.\r

Terdiri dari:\r
- **NotificationBell** — Ikon lonceng dengan badge notifikasi\r
- **Theme Toggle** — Tombol untuk beralih tema gelap/terang\r
- **User Menu** — Dropdown avatar dengan menu pengguna\r

### State Dependencies\r
- \`useAuth()\` — dari \`@/lib/auth-context\` (dibungkus AuthProvider di preview)\r
- \`useTheme()\` — dari \`next-themes\` (dibungkus ThemeProvider di preview)\r
- \`useRouter()\` — dari \`next/navigation\` (disediakan Storybook Next.js)\r

### Catatan\r
Data user diambil dari localStorage yang di-set oleh decorator global\r
di \`.storybook/preview.tsx\`. Untuk mode Dark Theme, decorator lokal\r
menyediakan ThemeProvider dengan defaultTheme="dark".`}}}},R={},z={name:`Buka Menu Pengguna`,parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}}},play:async({canvasElement:e})=>{let t=j(e).getByLabelText(`Menu pengguna`);await A.click(t)}},B={name:`Mobile`,parameters:{viewport:{defaultViewport:`mobile`},nextjs:{appDirectory:!0,navigation:{pathname:`/`}}}},V={name:`Tablet`,parameters:{viewport:{defaultViewport:`tablet`},nextjs:{appDirectory:!0,navigation:{pathname:`/`}}}},H={name:`Dark Theme`,decorators:[e=>(0,I.jsx)(o,{attribute:`class`,defaultTheme:`dark`,enableSystem:!1,children:(0,I.jsx)(e,{})})],parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{}`,...R.parameters?.docs?.source},description:{story:`Tema terang dengan data user dari localStorage mock`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: "Buka Menu Pengguna",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Cari tombol user menu via aria-label
    const userMenuTrigger = canvas.getByLabelText("Menu pengguna");
    await userEvent.click(userMenuTrigger);
  }
}`,...z.parameters?.docs?.source},description:{story:`User menu dropdown terbuka — play function mengklik avatar`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "Mobile",
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}`,...B.parameters?.docs?.source},description:{story:`Mobile viewport — 375px untuk verifikasi responsive design`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: "Tablet",
  parameters: {
    viewport: {
      defaultViewport: "tablet"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}`,...V.parameters?.docs?.source},description:{story:`Tablet viewport — 768px`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: "Dark Theme",
  decorators: [Story => <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>\r
        <Story />\r
      </ThemeProvider>],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}`,...H.parameters?.docs?.source},description:{story:`Tema gelap — menggunakan decorator lokal dengan ThemeProvider dark`,...H.parameters?.docs?.description}}},U=[`Default`,`OpenUserMenu`,`Mobile`,`Tablet`,`DarkTheme`]}))();export{H as DarkTheme,R as Default,B as Mobile,z as OpenUserMenu,V as Tablet,U as __namedExportsOrder,L as default};