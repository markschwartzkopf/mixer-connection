type x = {
  someMixer: {       
    channelStrips: { 
      '01': {        
        mute:boolean;
        fader:number;
      }
      '02': {        
        mute:boolean;
        fader:number;
      }
      '03': {
        mute:boolean;
        fader:number;
      }
      '04': {
        mute:boolean;
        fader:number;
      }
      '05': {
        mute:boolean;
        fader:number;
      }
      '06': {
        mute:boolean;
        fader:number;
      }
      '07': {
        mute:boolean;
        fader:number;
      }
      '08': {
        mute:boolean;
        fader:number;
      }
    }
    config: {
      name:string;
    }
  }
}

const y: x = {
	someMixer: {
		channelStrips: {
			'01': { mute: true, fader: 0 },
			'02': { mute: true, fader: 0 },
			'03': { mute: true, fader: 0 },
			'04': { mute: true, fader: 0 },
			'05': { mute: true, fader: 0 },
			'06': { mute: true, fader: 0 },
			'07': { mute: true, fader: 0 },
			'08': { mute: true, fader: 0 },
		},
		config: {
			name: 'hey',
		},
	},
};
