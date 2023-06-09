import styles from './DrawerCustom.module.scss'

function DrawerCustom ({ children, opened }) {
  
  if (opened) {
    document.getElementsByTagName('body')[0].classList.add('no-scrollbar')
  } else {
    document.getElementsByTagName('body')[0].classList.remove('no-scrollbar')
  }

  return (
    <div className={[styles.drawer, opened ? styles['show-drawer'] : ''].join(' ')}>
      {children}
    </div>
  )
}

export default DrawerCustom