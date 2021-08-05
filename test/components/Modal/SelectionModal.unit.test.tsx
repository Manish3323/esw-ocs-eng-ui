import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'chai'
import React from 'react'
import { SelectionModal } from '../../../src/components/modal/SelectionModal'

describe('SelectionModal', () => {
  it('should render modal with title and given list of data | ESW-441', async () => {
    const modalProps = {
      data: ['data-1', 'data-2'],
      title: 'some-title',
      okText: 'Start',
      onChange: () => true,
      selectedItem: '',
      visible: true
    }
    render(<SelectionModal {...modalProps} />)

    const title = screen.getByText('some-title')
    const data1 = screen.getByRole('menuitem', {
      name: 'data-1'
    })
    const data2 = screen.getByRole('menuitem', {
      name: 'data-2'
    })

    expect(title).to.exist
    expect(data1.innerText).eq('data-1')
    expect(data2.innerText).eq('data-2')
  })

  it('should call onChange method when menu item is selected | ESW-441', () => {
    let value = ''
    const modalProps = {
      data: ['data-1', 'data-2'],
      title: 'some-title',
      okText: 'Start',
      onChange: (selectedKey: string) => (value = selectedKey),
      selectedItem: '',
      visible: true
    }
    render(<SelectionModal {...modalProps} />)

    const data1 = screen.getByRole('menuitem', {
      name: 'data-1'
    })

    userEvent.click(data1)

    expect(value).eq('data-1')
  })

  it('should handle onOk and onCancel event | ESW-441', () => {
    let value = ''
    const modalProps = {
      data: ['data-1'],
      title: 'some-title',
      okText: 'Start',
      onChange: () => true,
      onOk: () => (value = 'Ok'),
      onCancel: () => (value = 'canceled'),
      selectedItem: 'data-1',
      visible: true
    }
    render(<SelectionModal {...modalProps} />)

    const okButton = screen.getByRole('button', { name: 'Start' })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })

    userEvent.click(okButton)
    expect(value).eq('Ok')

    userEvent.click(cancelButton)
    expect(value).eq('canceled')
  })

  it('should not call onOk if any item is not selected | ESW-441', () => {
    let value = 'value not changed'
    const modalProps = {
      data: ['data-1'],
      title: 'some-title',
      okText: 'Start',
      onChange: () => true,
      onOk: () => (value = 'Ok'),
      onCancel: () => (value = 'canceled'),
      selectedItem: '',
      visible: true
    }
    render(<SelectionModal {...modalProps} />)

    const okButton = screen.getByRole('button', { name: 'Start' })

    userEvent.click(okButton)
    expect(value).eq('value not changed')
  })

  it('should not show menu if visible equals false | ESW-441', () => {
    const modalProps = {
      data: [],
      title: 'some-title',
      okText: 'Start',
      onChange: () => true,
      onOk: () => true,
      onCancel: () => true,
      selectedItem: '',
      visible: false
    }

    render(<SelectionModal {...modalProps} />)
    expect(screen.queryByText('some-title')).to.null
  })

  it('should show empty if data is not present | ESW-441', () => {
    const modalProps = {
      data: [],
      title: 'some-title',
      okText: 'Start',
      onChange: () => true,
      onOk: () => true,
      onCancel: () => true,
      selectedItem: '',
      visible: true
    }

    render(<SelectionModal {...modalProps} />)

    expect(screen.getByText('No Data')).to.exist
    expect(screen.queryByRole('menuitem')).to.null
    expect((screen.queryByRole('button', { name: 'Start' }) as HTMLButtonElement).disabled).to.true
  })
})
