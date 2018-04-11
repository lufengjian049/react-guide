/**
 * Provider里面提供context和actions
 */
import React from 'react'

const initstate = {
    theme: 'dark',
    color: '#000'
}

const GlobalStoreContext = React.createContext({
    ...initstate
});

class GlobalStoreContextProvider extends React.Component {
    state = {
        ...initstate
    };

    handleContextChange = action => {
        switch (action.type) {
          case "UPDATE_THEME":
            return this.setState({
              theme: action.theme
            });
          case "UPDATE_COLOR":
            return this.setState({
              color: action.color
            });
          case "UPDATE_THEME_THEN_COLOR":
            return new Promise(resolve => {
              resolve(action.theme);
            })
              .then(theme => {
                this.setState({
                  theme
                });
                return action.color;
              })
              .then(color => {
                this.setState({
                  color
                });
              });
          default:
            return;
        }
    }

    render() {
        return (
            <GlobalStoreContext.Provider
                value={{
                    dispatch: this.handleContextChange,
                    ...this.state
                }}
            >
                {this.props.children}
            </GlobalStoreContext.Provider>
        )
    }
}

const SubComponent = props => {
    <div>
        {
            <button
                onClick={() => {
                    props.dispatch({
                        type: 'UPDATE_THEME',
                        theme: 'light'
                    })
                }}
            >
                change
            </button>
        }
    </div>
}

export default class ContextAsRedux extends React.Component {
    render() {
        <GlobalStoreContextProvider>
            <GlobalStoreContext.Consumer>
                {
                    context => <SubComponent {...context} />
                }
            </GlobalStoreContext.Consumer>
        </GlobalStoreContextProvider>
    }
}