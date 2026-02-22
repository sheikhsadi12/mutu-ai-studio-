
// Polyfill for MPEGMode and Lame which are missing in lamejs module imports

export {};

declare global {
  interface Window {
    MPEGMode: any;
    Lame: any;
  }
}

const polyfillMPEGMode = () => {
  if (typeof window !== 'undefined' && !window.MPEGMode) {
    const MPEGMode: any = function(ordinal: number) {
      // @ts-ignore
      var _ordinal = ordinal;
      // @ts-ignore
      this.ordinal = function() {
        return _ordinal;
      };
    };

    MPEGMode.STEREO = new MPEGMode(0);
    MPEGMode.JOINT_STEREO = new MPEGMode(1);
    MPEGMode.DUAL_CHANNEL = new MPEGMode(2);
    MPEGMode.MONO = new MPEGMode(3);
    MPEGMode.NOT_SET = new MPEGMode(4);

    window.MPEGMode = MPEGMode;
    if (typeof global !== 'undefined') {
      (global as any).MPEGMode = MPEGMode;
    }
  } else if (typeof global !== 'undefined' && !(global as any).MPEGMode) {
      const MPEGMode: any = function(ordinal: number) {
          // @ts-ignore
          var _ordinal = ordinal;
          // @ts-ignore
          this.ordinal = function() {
            return _ordinal;
          };
        };
      
        MPEGMode.STEREO = new MPEGMode(0);
        MPEGMode.JOINT_STEREO = new MPEGMode(1);
        MPEGMode.DUAL_CHANNEL = new MPEGMode(2);
        MPEGMode.MONO = new MPEGMode(3);
        MPEGMode.NOT_SET = new MPEGMode(4);

        (global as any).MPEGMode = MPEGMode;
  }
};

const polyfillLame = () => {
    const LAME_MAXALBUMART = (128 * 1024);
    const LAME_MAXMP3BUFFER = (16384 + LAME_MAXALBUMART);

    const LameMock = {
        LAME_MAXMP3BUFFER: LAME_MAXMP3BUFFER
    };

    if (typeof window !== 'undefined' && !window.Lame) {
        window.Lame = LameMock;
        if (typeof global !== 'undefined') {
            (global as any).Lame = LameMock;
        }
    } else if (typeof global !== 'undefined' && !(global as any).Lame) {
        (global as any).Lame = LameMock;
    }
};

polyfillMPEGMode();
polyfillLame();
