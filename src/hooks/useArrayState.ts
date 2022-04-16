import { useState } from "react";

function useArrayState(initial: Array<any> | null): Array<any> {
  const [array, setArray] = useState<Array<any>>(initial ?? []);

  const doAppend = (new_el: any) => {
    setArray([
      ...array,
      new_el
    ]);
  };

  const doDelete = (to_remove: any) => {
    const ind: number = array.indexOf(to_remove);
    if(ind > -1){
      const tmp: Array<any> = array.slice();
      tmp.splice(ind, 1);
      setArray(tmp);
    }
  };

  return [array, setArray, doAppend, doDelete];
}

export default useArrayState;
