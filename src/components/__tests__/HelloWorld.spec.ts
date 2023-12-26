import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Slidedown from '../SlidedownComponent.vue'

describe('Slidedown', () => {
  it('renders properly', () => {
    const wrapper = mount(Slidedown, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
