import React from '../../../node_modules/react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
    render() {
        return (
            <div className="TrackList">
                {this.props.tracks.map( track => {
                        return <Track key={track.id} track={track} onAdd={this.props.onAdd}/>
                    }
                )}
            </div>
        )
    }
}

export default TrackList;