/* eslint-disable no-console */
// 请勿删除
if (import.meta.env.PROD) {
  const copyright_common_style = 'font-size: 14px; margin-bottom: 2px; padding: 6px 8px; color: #fff;'
  const copyright_main_style = `${copyright_common_style} background: #e24329;`
  const copyright_sub_style = `${copyright_common_style} background: #707070;`
  if ((navigator.language).toLowerCase() === 'zh-cn') {
    console.info('%cPowered by%cSecuFlow_PG1', copyright_sub_style, copyright_main_style, '\n')
  }
  else {
    console.info('%cPowered by%cSecuFlow_PG1', copyright_sub_style, copyright_main_style, '\n')
  }
}

export {}
