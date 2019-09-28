module.exports = {
    /**
     * Determines whether to update status or not
     */
    status: true,

    /**
     * Sets the state of logging
     *
     * @param {boolean} state The state of logging
     */
    setStatus: state => {
        if (!state || typeof state !== 'boolean') return;
        this.status = state;
    },

    /**
     * An array or string containing status channel(s)
     */
    statusChannels: [
        '627278142133764096'
    ],

    waitTime: 3500
};