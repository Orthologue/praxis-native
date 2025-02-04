// external imports
import React from 'react'
import { View, ScrollView, Text } from 'react-native'
import { connect } from 'react-redux'
import { graphql, gql } from 'react-apollo'
import { Map } from 'immutable'
// local imports
import styles from './styles'
import IngredientControl from './IngredientControl'
import InstructionsControl from './InstructionsControl'
import BreadControl from './BreadControl'
import {
    PrimaryButton, SecondaryButton,
    Breadcrumbs, BreadcrumbChild,
} from '../../quark/components'
import { addItem } from '../../store'

class ItemEditor extends React.Component {
    state = {
        ingredients: {}, // a map of ingredient name -> "none" | "light" | "norm" | "extra" | "side"
        bread: "sourdough",
        instructions: [],
    }

    render() {
        const {data, fromCategory, closeEditor, submitItem} = this.props

        return data.loading ? (
            <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}>
                <Text> loading... </Text>
            </View>
        ) : (
            <View style={styles.container}>
                <Breadcrumbs style={styles.breadcrumbs}>
                    <BreadcrumbChild onPress={closeEditor}>
                        {fromCategory}
                    </BreadcrumbChild>
                    <BreadcrumbChild active={true}>
                        {data.item.name}
                    </BreadcrumbChild>
                </Breadcrumbs>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <IngredientControl
                        ingredients={this.state.ingredients}
                        onChange={this._update('ingredients')}
                        item={data.item}
                        style={styles.control}
                    />
                    {data.item.bread && data.item.bread.length > 0 && (
                        <BreadControl
                            bread={this.state.bread}
                            onChange={this._update('bread')}
                            item={data.item}
                            style={styles.control}
                        />
                    )}
                    <InstructionsControl
                        instructions={this.state.instructions}
                        onChange={this._update('instructions')}
                    />
                </ScrollView>
                <View style={styles.footer}>
                    <SecondaryButton onPress={closeEditor} style={styles.cancelButton}>
                        cancel
                    </SecondaryButton>
                    <PrimaryButton onPress={this._submit}>
                        add item
                    </PrimaryButton>
                </View>
            </View>
        )
    }

    _submit() {
        // add the item to the ticket
        this.props.submitItem({
            ...this.state,
            plu: this.props.data.item.plu,
        })
        // close the editor
        this.props.closeEditor()
    }

    constructor(...args) {
        super(...args)

        this._update = name => val => this.setState({[name]: val})
        this._submit = this._submit.bind(this)
    }
}

const query = gql`
    query ItemEditor($itemId: ID!) {
        item: Item(id: $itemId) {
            name
            bread
            plu

            ${IngredientControl.fragments.item}
            ${BreadControl.fragments.item}
        }
    }
`

const mapDispatchToProps = dispatch => ({
    submitItem: (item) => dispatch(addItem(item)),
})

const Connected = connect(null, mapDispatchToProps)(ItemEditor)

export default graphql(query, {
    options: ({ itemId }) => ({
        variables: {
            itemId,
        }
    })
})(Connected)
