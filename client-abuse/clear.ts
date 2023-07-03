/**
 * Clear the in-game console
 * @author GimmeCookies 20181230
 */
export function clear() {
  console.log(
    "<script>angular.element(document.getElementsByClassName('fa fa-trash ng-scope')[0].parentNode).scope().Console.clear()</script>"
  )
}
