import React from 'react'
import ContextCompose  from './ContextCompose'

const ThemeContext = React.createContext('light-default');
const ColorContext = React.createContext('blue-default');
const LanguageContext = React.createContext('en-default');
//refs
const ref = React.createRef();

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.changeTheme = this.changeTheme.bind(this);
        this.state = {
            theme: 'dark',
            color: 'blue',
            language: 'en',
            changeTheme: this.changeTheme
        }
    }
    changeTheme(theme) {
        //state更新会丢失
        ref.current.showDesc('test desc~~~');
        this.setState({
            theme
        })
    }
    render() {
        const ThemeButton = withTheme(Button);
        const ThemeButtonWithRef = withThemeAndRef(Button);
        return (
                // Compose 提供Provider
                <ContextCompose
                    contexts={[
                        <ThemeContext.Provider value={this.state} />,
                        <ColorContext.Provider value={this.state.color} />,
                        <LanguageContext.Provider value={this.state.language} />
                    ]}
                >
                    {/* 正常的Consumer，包含事件 */}
                    <ThemedArea />
                    <OtherTextComponent />
                    {/* HOC */}
                    <ThemeButton />
                    {/* HOC && Refs */}
                    <ThemeButtonWithRef ref={ref}/>
                    {/* Compose 提供Consumer */}
                    <ContextCompose
                        contexts={[
                            ThemeContext,
                            LanguageContext
                        ]}
                    >
                        {
                            (theme,language) => (
                                <div>
                                    {theme.theme};{language}
                                </div>
                            )
                        }
                    </ContextCompose>
                </ContextCompose>
        )
    }
}
//1.如果没有提供对应消费者(Consumer)的数据提供者(Provider)；消费的值从createContext(defaultValue)defaultValue中提供
//2.如果有对应的Provider,消费的值就从Provider的value中获取，如果value没有配置属性，则为空。
//坑：同时更新 context 和 消费组件的state，state会丢失！！！！根源在于，消费组件是通过一个function返回，所以每次更新context后，都是一个新的消费组件实例！！！
function ThemedArea(props) {
    return (
        <ThemeContext.Consumer>
            {
                ({theme,changeTheme}) =>  <div onClick={() => {changeTheme('light!!!');}}>from context: {theme}</div>
            }
        </ThemeContext.Consumer>
    )
}
class OtherTextComponent extends React.Component {
    render() {
        console.log('OtherTextComponent render...');
        return (
            <div>
                other component...
            </div>
        )
    }
}

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            desc: ''
        }
        this.showDesc = this.showDesc.bind(this);
    }
    showDesc(desc) {
        this.setState({
            desc
        })
    }
    render() {
        return (
            <button>{this.props.theme};button;{this.state.desc}</button>
        )
    }
    componentDidUpdate() {
        console.log('desc componentDidUpdate',this.state.desc);
    }
    componentDidMount() {
      console.log('desc componentDidMount',this.state.desc);
    }
}


//HOC
function withTheme(Component) {
    return function ThemedComponent(props) {
        return (
            <ThemeContext.Consumer>
                {
                    ({theme}) => <Component {...props} theme={theme} />
                }
            </ThemeContext.Consumer>
        )
    }
}

//refs --- 需要React.createRef()创建一个ref
function withThemeAndRef(Component) {
    return React.forwardRef((props,ref) => {
        return (
            <ThemeContext.Consumer>
                {
                    ({theme}) => <Component {...props} theme={theme} ref={ref} />
                }
            </ThemeContext.Consumer>
        )
    })
}