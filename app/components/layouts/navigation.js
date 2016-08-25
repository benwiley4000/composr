import cx from 'classnames';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';

import {Link} from 'react-router';

class Navigation extends React.Component {

    static get propTypes() {
        return {
            pushState: React.PropTypes.func
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            signUp: false
        }
    }

    toggleModal(state) {
        this.setState({ signUp: state });
    }

    render() {
        return (
            <div className="top_navigation">
                <AppBar
                    title={<Link to="/"><span style={{marginTop: '11px'}} className="logo"> </span></Link> }
                />
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

function mapStateToProps(state) {
    let username = null;

    return {
        name:  username ? `hello ${ username }` : 'sign up'
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(Navigation);