import { shallowMount } from '@vue/test-utils'
import { Hello } from '@/components'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(Hello, {
      props: { msg }
    })

    expect(wrapper.text()).toMatch(msg)
  })
})
