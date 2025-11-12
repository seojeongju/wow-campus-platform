/**
 * Page Component
 * Route: /dashboard/legacy
 * Original: src/index.tsx lines 13775-14359
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAC7Ai4DASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAAAAEGBwIFCAQDCf/EAFsQAAEDAwEEBgUFCQsIBwkAAAEAAgMEBREGBxIhMRNBUWFxgQgUIpGhFTJTktEWQlJicoKxssEXIyQzN0N0dZOisyY0NTZEVFVkGCVzlKPD4SdWY2WDhMLS8P/EABoBAQACAwEAAAAAAAAAAAAAAAAEBQECAwb/xAA7EQABAwICBQkHBAICAwAAAAAAAQIDBBEFIRIxQZHhExQVUVNjgZLwIjJhcbHB0QYjUqEz8RY0QkNi/9oADAMBAAIRAxEAPwDpVNqSyCAEwkmEAITQgBCEwgBCEIBoQhACaEIATQhACaSaAEJoQAhCaAEIQEAITQgBCEIAQhNAJNCEAIQhACEIQAhCEAkJoQCQmkgBCEIBITQgEhNJAJCaSAEk0IBJJoQCSTQgEhCEAkJpIASTSQCQmkgEhNJACRTQgEgoQgEOeFksWrJACaSaAEIQgBNIJoATQhACEICAaEIQDQhCAE0IQDQhCAE0IQAmhCAEIQgGhCEAIQmgEhNCAEIQgBCEYQAhCEAJJoQCQmkgBCEIASTQgEhCEAkJpIBITQgMUJoQGKE0kAJJoQCSTQgEkmhAJCEIBFJNJACEIQCQmkgABPrTQgAIQjCAEIwexCAYQgLLBwgEhGChACYSWQB7EAICMIQAmgBBwBkkAd6AE0NwRkHI7QmgEmhMBAJCeEIAQnhGEAk0JoBJoATwgEhCEAITQgEmhDiG8yAO9ACEDB5HIQgBCEIAwkssJYQCQhCAEJowgMUJoQCQmjCAxQng9hSQCQnhGEBihPCRQCQmlhAJCZB7CkUAkITx3IDFCZGEkAJJ4ykcA4PNAGFisyMLEoBIQhACSaEA00kIAWk1rDPNpmtNHLLFURN6Vro3lp9niRkd2Vu0nNa9pa8AtcMEdoWzHaDkd1GkrOUYrF2pYoAXq64wLnW/27vtV3aYrvlOwUNWTl74gHn8YcHfEFUfeKB1tu1XRuH8TI5g7x1H3YVkbJa4SW+soXH2oXiVg/FdwPxHxV/icTHwNljT/SnkMBqJI6t1PMqrfLNdqelJ8BkqlNYX2qqdR1r6WrnjgY/omCOVzRhvDPA9ZyVbOorh8l2Ktq84fHGdz8o8G/EhUE4kkknJXDB4Ec50jk1ZEz9R1axtZCxbKufr1sJfoG+VUepKeKrq55YagGEiSQuAceLTxPaMeat5c5wyvhmZLEd2SNwc09hHELoK11jK+3U1XH82eNsnhkcR71ri8CMe17UyU2/TlWssTonLdUW/gprtaXE2vTVZURuLZi3o4yDxDncMjw4nyVK/KlxPAV9bk8h07vtU82u3DLqG3NPLM7x8G/8A5KKaJt3ylqeiicMxsd0r/wAlvH9OB5qVh8bYaZZnp8dxBxiaSorm00SqlrJl1qXPp+lkorLRU88j5JmRDpHPcXEuPE8T3lO7XahtEHTXCoZC371p4ud4DmVC9Y61rqCZ9JQ0clKckdPUMwT3sHLz4+CrWqqp6yodPVTSTTO5ve7JKh0uGPqP3JFsi7yxr8cio/2Yku5Nyfn1mTm/7QqupLorQz1WH6V4DpD+wfFQusramskL6qommeeuR5d+leYFCvYaSKBLMb+TydTiFRVLeRy/LZuPRR11XRSB9JUzQPHXG8tU309tFqoHNivMfrMXLpowBIPEcj8FACgJNSRTpZ7fyKXEKilW8bvDZuOh7VdKK60/T2+oZMzr3Txb3Ecwqs2jy3C2anl6Cuq44KhjZmNbM4AdRA49o+KitBW1FBUNqKSd8EreT2HB8O/wUh1FW3TUFigrq6gIbSOx620boe12BjHXxxxHBVsVDzSdHXRWrlmXk+K9IUrmIite3PK9sterVlfXvNjsvvlU6/vo62qmmZUxkM6WQuw5vHhnuyrYXOloq3W+50tYz50EjZPEA8R7l0THK2WNkkZDmPAc0jrB4hRMXhSOVHtTJU+hZfp6pWWnWNy3Vq/0vpSN7Rbo+16alMLyyoqHCGNzTgjPEkeQKp/5Yuf/ABGt/t3fapbtZuXrN5hoWHLKWPLvy3cf0Y96giscMp2tgRzkzXMpcbrXuqlaxyojcsv7/Beug7k66aYpJZXF80YMMhJySW9Z8RgqQKr9kFx3KuttzzwkaJmA9o4O+BHuVlV1Syjo56mY4jhjdI7wAyqKsh5KdzE8PE9VhtTy9KyRV2Z+BUu0bUFYdTS09DWVEENM0RkRSFoLuZJwe/HktnsokuFwuVXU1dbVTQQRhobJK5zS5x7CeoA+9V3WTPqqqaomOZJXmRx7ycq59mVu9Q0rA9zcS1TjO7wPBvwA96t61jKakRiIl1sn5PPYXJJW4g6VVXRS622dSevgSxCELzx7AFqtUagtumLNPdLzUCCki83Pd1NaOtx6gtquQvSG1dLqHW81uhkJttpcYI2A8HS/zj/HPs+A71IpoOXfo7DnI/QS56Ndbb9R36eSGySOs1uzhohI6d47XP6vBuPEqr6y4VtbKZKytqqiQ8S6aZzyfMlSLZtouv1zqFtuonCGCNvSVNS4ZELM88dZPID9gK6esexnRVrpmxy2sXCYD2pqt5eXHwGGjyCtZJoKX2GpmRmsfLmqnJNpvt3tMoltl0rqSQcQYZ3N+GcFXZsw271TauG3a2cySneQxlxa0NdGf/iAcCO8YI68qfan2IaRu9I8W+lfaKrHsS0ziW572EkEeGPFQnZtsIlptRVNVrIQz0VJJu00DDllV1h7usN/FPEnnwHHhJUU0zFVyWX+zdrJGLkdDRubIxr2ODmOGQQcgjtCySY1sbGsY0NY0Ya0DAA7AF4NQ3ansVjrrrWuxT0kLpn9+BwA7ycAeKqUS5KOffSS13XQajpLDY7hU0gomdLVPppXRl0jx7LSQeQbx/O7lUNPrTU0FRFNHf7q58bw8B1XIWkg54jPELXXu41F4u1bc6129U1czppD3uOcDuHJe3VGm67TNZSU9yYWSVNJFVs4fevGceIOQe8L0cMDI2IxyJcgOerlVUO3dJXuDUmmrbeKXAjq4WyFo+9dyc3ycCPJbZc/+ixqnfguOmKl/GP+GUoJ+9OBI0eeD5ldAKhni5KRWE1jtJtyN7SZpafZ/qKanlkhmjoJnMkjcWuaQw4II4grjE6q1CRg3+78f+dk+1dl7T/5OtSj/wCXz/qFcOYVjhrUVrroR6hbKh2JsL1k7V+j2MrZd+7W/EFTk8XjHsSeYHHvBVi4XE+yfWD9F6xpa97neoS/vFYwdcRPzvFpwR4d67WikZNEyWJ7XxvAc1zTkOB4ghRKyDkZMtSnWJ+k0yXN3pE7Q6v5di07Ya2emjoTv1ctPKWOfKRwZkHk0Hj3nuV0bTNVxaN0hWXRxaanHRUsZ+/ld83yHEnuBXEVRPLU1MtRUyOlnleZJHuOS5xOST5rvh9Ppu5R2pDSd9k0ULC2T6hvNTtI07FU3i5TQvq2tfHJVPc1wIPAgnBXYZ+f5riXZEcbTdNf01n7V20T7QK1xJESRLdRmnW7VOM9oeqdRUmu9Q09Pf7rFBFXzMZGyrka1rQ84AAPAKPHWOp//eK8/wDfZPtXr2m/yial/rCf9cqx/R20hYdT0N9ff7bFWvp5IWxGRzhugh2eRHYFZLycUKSObsTYR/ac/RRSr4taapjcHM1JeQR/zsh/apjpbbXqyzTRi4VLLvSA+1HVNAfjukAznxyr3q9kGhqiF0fyHHCSMb8M0jXDvHtYXM+1LSP3Faumtcczp6VzGz08jwN4xuzwdjrBBHfjK5RyU9Suho5/I3c18edzrjROq7brGxRXS1PO4TuSxP8AnwvHNrvt6wq39Jy519ssNjdba6qo3vqpA91PK6MuAZyJBGVX/oy3mWi11NbN8+rXGmdlmeG/H7TT7t4eamnpV8bDp/8ApUn6gUJsCRVSM2HVX6UaqVHoXU1+l1rYIpr3dJIn18DXsfVyFrgZGgggniF2aea4d0CP8udPf1jT/wCI1dxO5rbEmo16WTYYp1uiguO9qOob1TbRtRQ095ucUEda9rI46uRrWjsABwAuw1xTtZ/lM1L/AE1/7FrhyIsi36jNQtmoXH6MN1r7lHqMXGvq6sxmDc9YmdJu53843iccgrU1xqmh0fp6e63Hec1hDIomnDppDyaPic9QBKp30UuWpv8A7f8A8xeb0rKub17T1FkinEU0+Oou3mtz5AfFHwpJV6GzgGu0YrkB1btS1TqWeTpLjLQ0ZPs0tE8xNA7CR7TvM+QUKkqJnybz55XP/CLyT71tNFUlvr9WWmjvU4gts1Q1k8hdu4afxurPAZ6srsGDQGkIqZsUWm7SYscC6na8kdu8ck+OVOmnjpLMRpxYx0uaqchWXV2o7NIHWy93CnA+9E7nM82nIPuXSuwvWd+1la7jJfIqdzKN7I2VUbNwyuIJILeXAY4jHNfXUOxXSF1jcaOlltVQeUlI87ue9jsj3YUo2f6Xh0bpWms8Eoncxz5JZtzd6V7jnOMnHDA8lBqaiGWP2W2cdo43tdmuRIEIQq87ghCEA00k0AkIQgKs2r2/oLvT1zBhtTHuuP4zf/Qj3LU7P7j6hqil3nYjqMwP/O5fEBWFtHoPXdLzvaMyUrhO3wHB3wJ9yppj3Rva9hw9pBaR1Ecl6ShVKmkWJdmX4PE4qi0WINnbqWy/n18Sz9rFw3KOjt7T7UjjM8dw4D4k+5RPQNuFx1PSiRodFBmZ4IyMN5fHC8mprw693Z9WQQ0saxrewAcfjlTnZNQdHQVle4cZniJh/Fbz+J+C1ci0dDZclX78DZrkxLFUcmbW/RPyv1IBqig+TNQV1IBhjJCWfkni34FWNsor/WbHLRuOX0snsj8V3EfHeWn2uW/drKK4MHCVphee9vEfAn3KNaVvb7HU1UrMnpqd8YA6nYy0+R/StntWsoktm5PqmRiJ6YZibkdk1b7lzT+xawrvlLUtdODlgf0bPyW8B+jPmplslt25DW3Fw4uIgYe4cXfs9yrQHjxOVfOl6D5M0/RUpGHtjDn/AJTuJ+JWmJO5CnbCm37G2BsWqrH1Ltl18V9Kei8xMmtNYyVjXt6F5w4ZHzSq5tWjKK6aYt9WyqNLXTNI9t2WSOyeGOecDq9ysq5f6Oq/+xf+qVWF+aW7NdPHHDpCc/Wwq+hc/wB1jrKqp9FLrFGxe/KzSRGr9W7dho71pe7WgudU0rnQj+ei9tnv6vPC0gKklm1nd7WGsE3rNOOHRT5dgdx5hbr5Q0pqX2bjTutVa7+eZgNJ7yOB/OHmrvl54f8AMy6dafg8tzSkqc6aTRd/F32UgQGVILLpC7XTdkbB6vTHj00/sjHcOZUiFx0tpb2LdB8qXBvOZxBaD+VyH5o81G7/AKqul63mVE/R05/mYvZb59Z81jl55/8AC3RTrX7Ibc0pKX/sP03fxb91/BPtJaVsMQfNHJHc54X7jpHcWNeADgN5dY7VKLvQtuNqqqJwAE0RYO444HyOFE9kUTmafqnn5r6k7vk1qnQC89VOekyo511RdZ7GgZG6marWI1HJq9azm90bo3uZI3de0lrh2Ec1dOgboyo0fBLO/HqbXRyE9QZxB+rhV5tEt4oNUVJaMR1GJ2+fP4grwWq+SUFiu1vbnFY1gafwePte9qvamJa6nY5uvLj6+B5SinTC6uRj9VlTdmm/7nhuta+4XGqrJfnTyOk8MngPIcFKb3p4UmgLZWhmKhr+kmOOO7Jyz4Yb71GLHROud4o6Ifz0gae5vWfdlXxdrfHcLRVUBADJojG3uOOB8jhc6+o5s+NjdSZ+Gr8nbCaLnkc0r9bsk+ev62KN0vcPkvUFDVk4YyQB/wCSeB+BVn7Urh6ppv1djv3yrkEf5o4n9AHmqekjdG58cgIe0lrh2Ec1utTX196itjH5/gtMI3Z++f1n3ALvUUvLTxypqTX4ZoRKSv5vSTQLrXV45L/Rr7XRuuFwpqSP508jYx3ZPNdDwRsghjiiG7HG0MaOwAYCqPZPb/WdQSVbxmOkjyPy3cB8N5W/1qrxeXSmRibPuX/6dg0KdZV1uX+k43I1cNb2W31s1JUzTCaFxY8CFxAPivP+6Hp/6ao/sHKKao0de6/UFfVU1I10Mspcx3StGR71qfuD1D/uLf7Zn2rrFSULmIrpLLbrT8EefEcUbI5rIboirb2V1bNpbtnvdHeLdNW0DnvijLmneaWnIGeR8QuCq2V9TWVFRIS6SWR0jieskkn9K7f2d2irtFjnpblCIpHzOdjeDsgtA6j3FcX6ttUti1NdLXO0iSkqHxeLc+yfMYPmtaJGMmkaxbps+RcI+SSFj5Us5UzT4nSHoq0EUOh7jWtaOnqa5zHu691jG4H953vV0rnL0WNVU9NJcNNVkrY5KiT1qk3jjfdgB7R34DSPNdHFV9Y1WzOuTIlRWJYSELzUVfSV7ZXUVVDUNikMUhieHbjxzacciOxRjoelUJ6UuqvV7bQ6ZpZP32qIqqoA8o2n2GnxcCfzQr3qJoqamlqKh4jhiYZHvdya0DJJ8lwrr7UEuqtXXO8SE7lRKeiafvIhwYPcB55U6gh5STSXUhxndott1my2RaZOrNe223vZvUkbvWars6JhBIPicN81efpQ6ZFw0rS32mjzUWt+5LgcTC8gH3O3T5lUVs813ctCS1s1opqGWaqa1r31DHOIaMnAw4Y4n4BSq77c9S3a11dvraGzvpaqF0Mjehfxa4YP3/erCaOZ0zXt1J6Ujsc1GKi7Sv8ARWoJtLaqtt5p8k0soc9o+/jPB7fNpK7toqqGto4KulkElPPG2WN45Oa4ZB9xX58tbjC6o9GjVPyppOax1Mmaq1O/e8ni6Bxy36pyPDC44lDdEkTYb0789Enu07+TvUn9Xz/qFcOPPAnuXcW07+TvUv8AV8/6hXDrvmnwWMM91xmo1ob7WWmqjTVfSRTbzoKykiq4JCPnse0EjxByPLvXQ3o2ay+V9Pv07XS5r7a3MBceMlOTw+qeHgWr7bQdGHVmyC0S0ke/dLdQxVFPgcXt6Nu+zzAyO9oXMtlvFdY7iyvtVS+mq2MewSN54c0tI9xW7bVkKtX3kML+0++wsLb/AKyGptYOoaOTetdrLoY8HhJJ9+/3jdHc3vUNn0zUQaHg1HUbzIqqt9Vp24+e0NcXO94AHgV5tJ2Op1NqOgs9HnpqqUNL+e43m5x8ACfJX56R1tpbPs109bqCMR0tLWNijb3CJ/Pv612V6QLHAzx9fE0sr9J6lM7JP5TdNf01n7V2z1rifZIP/adpr+ms/au2OsKBif8AlT5Han91Th3aS7O0LUmf+IT/AK5Vwei3WUtLb9RiqqYIC6WDd6WRrM+y/tKp3aR/KDqT+sZ/1yo5lvWArJYuWgRl7ZIR9PQfc7urtR2ShgdNV3i3QxNGS51Sz7VyVtn1ZTav1tLW28ONBBE2mge4YMjWkkux1ZLjjuwoTG0uOI2ZcepoUs0vs51RqeeNtBa54qcnjU1LTFE0duTz8slcoaaOlXTc42dI6TJEJJ6NtulrNpMdU1p6KhppZXu6gXDcA/vH3KwfSnbnT9gP/NyfqKwdmehaHQtjNJTP6esnIfVVJbgyOHIAdTRxwPEqFelDTOk0Za6hoy2Gv3XHs3o3Y+IUJJ0lq2uTUd9DRjVFKA0Ica409/WNP/iNXcJ5rg6yVgt17t9cRkU1RHOR2hrgf2Lu2nniqqeKop3tkgmYJGPachzSMgjyW+KIum1TWmXJUMyuKtrBztL1L/TXrtRzmtaXPcGsaMucTgADrK4d1vcYrxrC9XGA5hqauWSM9rS44PuwsYYirIq/AVK+yhcfopD2dTHvp/8AzFNtuWhJ9ZaegmtbQ67W9znwsJx0zHAbzM9vAEeGOtRb0VqR7LPqCrIIZJPFE09pa1xP64V3zzxU8RlqJY4owQC+RwaBk4HE95AXCpkVlSrm60N40RY0RTgispKiiqpKatglp6iM7r4pWFrmnsIK3unda6k08GstF5rKeFvKEv34/qOyPgux9Qaas2oYgy92ulrQBgOlZ7bfBw4jyKre/bBdNVoe601NdbJTyG900Y8ncf7ymtxCKRLSt+5yWBzfdUhumtv90pnsj1Fbqeth5Olpv3qQd+OLT8Fe+k9UWnVlpbcLLUiaLO69jhuvid+C5vUfgepce690jX6LvzrZcnRyksEsU0ed2VhJAIzyOQQR3KXejldZ6HaNDRRvPq9whkilZ1EtaXtPiN0+8rWopInR8rF8xHK5HaLjqxCChVBLBCEIBppBZIDFCaSAxljZNC+KUZje0scO0EYK58udI+33Gpo5PnQSOjPfg8D7l0KopqDQ1HerrJXPq5oHyBoc1jQQSBjPHuwrHDattM9dPUpS43h762NvJe8i/wBerFOsBJAaMk8AO1X9p+gFsstHR/fRRgP/ACjxd8SVGbfs7oaOvp6k1tRKIZBJuOY0BxHEAqbrpiVayo0Wx6kOWCYZJR6b5kzXLwNBrugFw0tWNaMywjp2eLefwyqR8F0Y5oe0tcMtIwQesKDfua24uJFdVgZ4DDeHdyW2G1zKdqsk1GmNYVLVvbJDrtZfsQLSNv8AlPUVDTEZZ0ge/wDJbxP6MeavjrUa0zpCksFbJVQ1E08j2dGOkAG6M5PLwUlUfEKptTIis1IhLwagdRQq2T3lW/4NHra4T2zTNZU0rWOkADPaGQA47pPxUY0zRz6l2eS0U5ja6CTcpXAYwWgEZ95GewqcXe3U92t01FV7/QSgB24cHgQRg+IXysFnpbHQmkoTKYi8vPSO3jk4+xc452sh0UT273ud5qWSWp0nL+3oqip8VX8FDVlLNR1MlPVROimjOHMcOIK+Cv2+2C3XyINroMyNGGys9l7fA/sKhlVsxJefVLmNzqEsXH3g/sV1Bi8Tk/dyU8vVfpyojd+x7Sbl/srVe6y2yqvFfHR0TN6R/Mnk0dZPcp9R7MWB4NdcnOb1thj3c+ZJ/QpxZbPQ2am6C3QNiafnO5uee0nrWtRi8bW2izU3ov07M56OqPZb1a1XcfSzW2G0WunoafiyJuN483HmT5lew8kJrzqqrlup7RrUaiNbqQr/AGu0HSWykrmD2oJDG8/iu5fEfFVUV0RebdFdrXUUNQXNjmbgubzac5BHmFDTswoMf6RqvqNV3h+IRwxcnJsPL4xg81TUcrCiZpnnt/0abZFbunu9TXPbllPHuNP4zv8A0B96thanTFhg0/b3UtPI+XeeZHPeACTy6vBbdVtZPy8yvTVsLrDaRaSmbEuvb8ykNo1v9Q1VUlrcRVIE7fP53xBUaaFeeq9K02ozTunnkgfDvAOY0HeBxwOfBaD9zCk6rnUf2bVcUuKRMha2Rc0PN12BVElQ98KJoqt9fXxNnsvtwo9NNncAJKt5kPbujg39BPmpevlR07KSlhp4uEcTAxvgBhfVUM0iyvV67T1tPCkETYk2JYE+tJC5nYFR3pDbNZ740aksUBlr4Y9yrgYMumYOT2jrcBwx1jHYryTXSKV0Tke01c1HJZT89YHSwTMlie+KaN281zSWuaR1g8wValj266vttK2CpdR3IMGA+qjO/wCbmkZ8TxV8a22T6X1ZM+qqKV9FcH8XVNIQxzj2ubgtd44z3qs630cJRIfUdSMMfZPSnPvDlarV086fupmReSkYvskC1Vtj1dqGlfSmrit9M8YeyiYWFw7C8ku9xC8mxq+ais+r6eLTFPJXGpcBUUe9hkjOtxPJuOe91fBWnaPRypWStdeNQTTMHOOmgEefznE/oVv6R0hZNJURprFQx04djpJT7Ukn5TjxPhyXOWqgaxWRtvf18zZsb1dpOUgPpIaqNl0S21QP3a27u6MtB4thGC/38G+ZXMOn7TPfb5QWukH7/VzNhb3ZPE+AGT5LqvaJsig1xqE3SvvtXBuxtiigjiaWxtHPBPaST5pbP9jds0dqKO8R3Gorp4mObE2WNrQwuGN7h14yPNYp6qOCFUT3lMvjc9911GuHo9aTAANZd8gcSJmcT9VH/R60p/v14/tWf/orjymoXOpv5KduTZ1HKG23ZbR6Ht1uuNmmqp6OWQwz+sODix+MtxgDgQHe4KG7LdVO0jre33JziKQu6CqA64ncCfLg7yXYmtdN0mrdN1lnrnOZFUNGJGgF0bgQWuGewhVB/wBHC24x90Vb/wB3Z9qnQ1jHRLHMpwfEqO0mFn7S3h+zjUbmODmut0xBByCCw8VxCR7Pku4IdJFuz52lqm5TTtdSOo/W3MAfuEEDhnGQMDyVYu9HS254ahrcd9Oz7Vzo6iOFHI5TaZjn2sW7o0/5IWPH+4wf4bVzBtp2fVlk1pPNaKContlfmoiEELniJxPts4Dhg8R3ELqy0UTbbaqKhY8vbTQshDyMFwa0DPwXryRyUWCodC/SadXsR6WUoz0a9FS22krNRXSmkhqqjNPTMlYWuZGD7TsHiMnA8G969PpUf6l2n+sB/hvV1HJ5qH7TNDwa7s1Nb6iuloxBUCcSRsDyfZLcYJ71uyovOkr+s1VlmaKHLOyEZ2mab/pjf0FdqkcQqd0psNo9O6kt13ivtTO6jmEoidTtAfjqyDwVxA8VvXTMmejmdRiFisSynDe0oY2g6kz/AMQn/XKuH0VqaCag1GZ4YpSJYAN9gdjg/tW91HsIt17v1wukl8rIX1k753RthaQ0uOcZz3qW7Mdn1NoGmuEVLXzVvrj2PLpIw3d3QRjh4rvPVRvgSNq55HOOJyP0lJhFS08TsxU8LD2tjAX1JJPFCFVkoS0GvNOxar0ncLPK4MdOzMUh+8kacsPvAz3ZW/QsoqtW6BUvkcFXa3VdnudRb7nA+nq6d5ZJG8cQf2g9R61M9F7VtSaToGUFJLBV0DP4uCrYXCPuaQQQO7OF01rXQtg1lC1t5pM1DBux1UJ3JWDsDusdxyFU9f6OzTKTbtRlsfU2opckebXDPuVw2thmbozIQ1hexbsIDrDa9qfU1ukoJZKaho5Ruyx0jC0yDsLiScdwxlQS2UVVdK+Cht8ElRVzuDI4oxkuKvii9HUdKDcNR70fW2npcE+bnfsVqaJ0FYNGxH5HpCal43ZKuY78rx2Z6h3DARa2CFtoUCQvet3n02b6YZpDSFFad5r6hoMtQ9vJ0ruLsdw4AdwVT+k7qKpa636dijljpHt9amkLSGzHJDWA9eOJPeR2K/l4L3aLdfaB1FeKKCspXcejlbnB7QeYPeOKrYpkZKkj0uSXsu3RTI5I0ntQ1TpiJkFHX+s0bOApqwdKxo7GnO83yOFOG+kRdBDh+n6Ay4+cJ3hvux+1Su9bAtPVb3PtVwrrcT947EzB4Zw74qOu9HWff9nU0O730Rz+urFZaKT2nJZfH7EdGzNyQqXWuq7lrK9G5Xd0fSBgjjjibhkTASd0DieZJyT1qzPRp0rU1F/l1JURuZRUkb4YHOH8ZK4YOO4NJye0hS/TuwKw0M7JrzX1V0LTnoQ0QxnxwS4+8K3qOmgoqWKmo4Y4KeJoZHFG0NawDqAHJcqisZyfJQpkbRwu0tJ59DzQmeaSrCSCEIQDCyWIWSASEIQCWQ5JJhACEFCAELGWRkMT5JXtZGxpc5zjgNA4klQWl2t6MrK+noqO5zVFTPI2KNkdLKd5xOAB7Patmsc73UuYVyJrJ4moltLvNRZrRCyhmdDV1EuA9uMhrRk/sHmvrs4dWTacFVcKiaolqZXPDpXFxDR7Ix2DgV2WnckPLquSrYiJWsWqWlRM0S69ScSUoQhRyYNNJNACaSaAE8KqrhqO6WDX01JNVySWx1Q1xjk9oNjfg8CeIxn4Kbaw1badH0cFVfZZoaeeTomPjhdIN7GcHdHDgCpEtM+PR26SXSxDpq1lQr2pkrFst/Wo36ajGj9dae1hLUxWCuM8tO0PkY+J0bg08ARvAZHgpDVxyTUsscEzoJXNIZK0Alh6jg81xVqtWzsiXfK6Zn3QqxdTbRg4gVDSAcZDoePwTEG0X6b+9CpnMk7Ru/gVXSq9hJ5U/JZqarExbRvpf70KBFtG+lH1oVjmXeN38DPSq9hJ5eJZyFWJg2jHlMPrQper7R/ph9aH7E5l3jd/AdKL2Enl4lnpqr+g2j/TD60P2LIQbRhzmH1ofsTmXeN38B0ovYSeXiWchVl0O0b6Ue+H7Fj0O0f6UfWhTmXeN38B0ovYSeXiWghVh0W0b6X4wpiPaNj+M+MKcy7xu/gOlF7CTy8SzU1WLo9oxHCT4wrHoto/0nxhTmXeN38B0qvYSeXiWemFV/RbR/pP70KyEe0Xrk+MKcz7xu/gExRV/wDRJ5eJZyFWLodox5S/3oVj0O0f6UfWh+xOZ943fwHSi9hJ5eJaGUlWTYdow5yj60P2JmHaN9KPrQpzPvG7+A6UXsJPLxLLyhVn0W0b6UfWhQIto2f40fWhTmfeN38B0ovYSeXiWWUKtuh2i/St+tD9iwMG0XP8c360P2LHM+8bv4DpRewk8vEstCrPoNov0zfrQ/Ysmw7RBzlH1oVnmXeN38B0ovYSeXiWShVs6PaIf5wfWhS6LaH9KPfCnM+8bv4DpRewk8vEslBVbiLaFnjK33wpmPaF9KPfCscz7xu/gZTE17F/l4ljJFVuYtoZ5Sj60KQg2h/TN+tD9izzPvG7+A6TXsX+XiWQhVv0G0P6Zn1ofsR0G0P6Zn1ofsTmado3fwHSa9i/y8SxyjCroQ7QRzmb9aH7EdHtA+lb9aFY5n3jd/Az0kvYv8vEsRCrp0W0DqlH1oVh0W0H6QfWhTmfeN38B0l3L/LxLHQVXHRbQfpR9aFHRbQfpB9aFZ5n3jd/Ax0n3L/LxLGwhVyI9oQ/nB9aFPd2g/hj60KxzPvG7+BnpPuX+XiWKvFergy1WyetkjdJHCAXNaRnBIHX4qEBu0H8Ie+FeG/O1k2z1XytumhLQJSOi5ZHZx545LeOiRXIivbvNJcUVsblSJ6LZf8Ax4lhWa8UN5g6WgnbJj5zDwezxH/8F71z5bTWtr4vk0z+t59joc73wV3aadeHW5vy8yBtR1dGfaI/GA4A+C2rqFKZbtddF3mmFYqtcio5ioqbdnr4G1TSTVcXIdayWKaAaSEIA60wkmEAIQUDiUBVfpE6m+RdEG3U8m7WXVxgGDxEQ4yHz4N/OVV+jdp/5V1s+5zMzT2qPpASOHSuy1nuG8fILSbb9TfdLr2tdDJvUVD/AASnweBDT7TvN2fIBXxsJsTdObN4KqqbuT12a6YnmGEewPqgHzKtVTm9Lba719CL78t9iGu2o1xrNRimactpYxGAPwne0f0tHkrSs9IKC00dIBjoYmsPiBx+OVTNjD77rSnfKM9PUmZ47gd4j3DCvHPFMRTkmRwdSXXxKjBF5xLPV/yWyfJOFhoQmqo9CCaSaAE0k0BVu1+gDa+hrQP42N0Lj3tOR8HfBbLUduGvdkktLgPrHU+/EesVEXL3kY8HLZ7UKP1rSskrR7dLI2UeHzT+n4LSbILiXRV1ve7iwieMdx4O/Z71bXWSia9NbF9fY8+1Up8VcxdUqX8U/wBLvObNlupnaS11bri9xZSl/QVTT9E/g7Phwd+au3QQ4AtIIIyCOtcYbbdN/c3tCuMMTN2krD65BgcN15O8B4O3h7l0VsF1R90mz+lZPJvV1uxST5PEgD2HebcDxBWte1JGNnbtLiFdFVYpYyELXagusdls1VcJml7YW5awc3uJw1o8SQFVkg2WO5CikGm625QNqNR3Wv8AWpBvGno5zBDD+KN3i4jtJWzslqq7XNKx92qa2hLR0cdUA6SN3/acC4dxHmgNuCDkAjhzWWFGdLn/ACo1Z/Sof8Fq+02rKFs80dJTXCvbA4slko6Z0jGOHMb3Ikd2UBIExgjhyXgoblSXa1OrLfMJoHNcN4cCCOYIPEEdhUL0JqihotG2mm3Kysqo4cyx0lO6Yx5ccb2BgeBOUBYeEYXis92orvRCrt83SRZLXZaWuY4c2uaeII7CtFJru1sDpRTXV9G04dVtonmEDrOcZx34QEpJDQS4gAdZTAUX19PFU7PLvUU8jZIZaQvY9pyHA8iFJab/ADaH8gfoQH0x3Ix3LQ3TTFFcaySqmqblHK7BIgrZI28Bjg0HA5KPaJ09T3HTtvuNXXXZ9Q/LnH1+UNJDyOWcdSAn2EHABJIAHMlRmTWtA1r5Y6G7zUjCQaqOieY8Dmc8yO8BfXVVVBXaDu1VRytlp5qCV8cjTkOBYeKAkPAgY5J4WlprnSWnSlBV18ojhbTRDOCS4lowABxJPYF5WawpGzwsr6G526KZwZHPVwbkZceQJBO6T34QEjwjC1l7v1BZJKVtykMTagvDXkeyN1u8c+XvPBeCn1hb5K6npqinuFEal27BJV0zomSnqAJ6z2HCAkWEsKKav1LNZ7taKWCmq3smqA2ZzKffbIwtd7LD+FkA4HUpHbawV1KJxBUU4JI3KiMxvGO4oD0YQQtTq6arp9MXOa2lwq2QOdGWjJGBxI78ZUXpmUVNdNPy6br6ieWqcHVLDUumEkG6d6R4JO6QcYPDicICe4SWS0GqrpVUYoqG1hhudwkMULnjLY2gZfIR1gDqQG9x3LFRgaRY5u/U3q9S1fMztqizB7mj2QO7C+tirK6kvUlju84qn9F09JV7oa6WMHDmuA4bwJHEcwgJFhLC0VVqu1QVFRTh881XDKYTTQwufI5wAJIaOY4jjyXost+obw6aOlfIyohx0tPPGY5WZ5ZaeOO/kgNrhJaKr1Xa6eqnpd6eashkMRp4IXSSOIAJIaOrBHHkvTZr9Q3eSaGmdLHUwgGSnniMUjB2lp6u8IDaJLT3HUVHRVzqKOKrraxrQ58NHCZHRg8i7qHmV97PeaO7tm9VdI2WE7s0EzDHJGereaeI8eSA2BSWgl1bb21MtNBFWVVVFI+N8NPCXubuHBcexueR61rp9VzRarFF8nXN9J6q55jZSZeXh4G+OPFmOHigJeheKoucFPW22lkEomr97ogW8t1u8d7s4LK63CC2Uraiq3ujdKyIboyd5zg0fEoD1oXgvF3obO+nFxm6Fs2/uvI9kbrd458veVrqbVdBLW09NNBX0hqHbsMlVTOjZIeoAnrPfhASBLC1F8FD8pWUVvrHTuqS2m6J5Dd/cJO+AeIwD2rWXzUlTb9U22ibRXCSkkbL0nRUwf0pDWlpYc54ZOeSAla8F9trbtap6F8romzYBe0ZIAcD+xfMXmnFVb4JYqmCSua8wiaPc9pvEtOeTscR4L73e4wWm3yVlXvdGwtaGsGXOc4gAAdZJKy1VaqKhq5qParXalPhZbJQWWDo6CAMJ+dI7i9/if2clsUZyBkEZ6j1IRzlct3LdQxjWNRrUsiAhJCwbDTWPWsggBCEIATCSYQAodta1N9ymha+tieG1kw9Wpe3pHgjPkMu8lMSuW/SR1R8q6vjs1O/NLam7rwDwMzgC73DdHvUilh5WVG7DnI7RbcgehdPv1Tq+2WloJZPKOmd+DGOLz7gfNda7Q62O1aSlhgAYZt2mjaOpvXj80EKrPRksMVNSXTU9cWRMJ9Tp3yODQBwLzk9+6PIq3bxU6WuHRfKtZb5+izutdUAgZ58Ae5TaiVHVKZXa3qIUrV5u5jXI1zk1qU7YrvPZrg2spBGZmgtHSNyMHmpjSbTqtjgKugglb1mNxYfjlSMN0GfZHyN5kLA6e0bceFMaPePL1eqwfdvfsUmarppl0pol+fqxQUuHVtM3Qpahvy9Ip77FrW0XZ7YulNLUO4COfDcnudyKkyre47M4iC+11zmnqjqG5B/OH2FZ2C9XTTFXFbNTsf6k87kNUTvNYeob3W3x4jwUGWmhkTSpnX+C6/DrLenraqJ2hXMt/8ASavHq+ZYqaXA8iCO1aTVWoIrFRNIYZ62Y7tPTt4l57eHHAUFjFe5Gt1ltJI2JqvetkQ2VyuNHbKcz19RHBF1Fx59wHMnwUIum0yljcWW2iknx9/K7cHu4n9C1cWkNQakqvXr5OKYP5CQZcB2NYPmjxIW/g0BYKBgdXzSSnrM0wjb7hj9KsmR0cP+Z2kvUmreUck+JVX/AFmpG3rdr3Z23EPu+vrncqKekfBSRwzMLHBrCTg95K1uh7iLZqeime7Eb3dDJ+S7h+nB8lZItuiacYd8k/nThx+LkGh0O88PknPdMB+gqTzyBsbo2RKiKQejqp0zJpZ2q5qkK9JnTnyjpGmvULM1FrlxIQOJhfgH3O3T5lVf6PWp/kDXkVHPJu0V1ApX5PASZzG735b+cumri+zX211VqkrqSWGsidTua2ZriQ4Y4cea4ivNBV2C/VdBUEx1lDOYy5vDDmng4e4ELjR/uwugf69KeikciOR7Vud9qO6/pJ6zS9SKSMyzQPjqWxjm/o3hxA8gVhs41IzVujLbdmkdNLHuVDR97K3g8e8Z8CFJQqlyK1bKSkW+Z5rXcKa60ENbQStlp5W7zXNPwPYR2LUOuFUNoEVu6b+Bm2unMWB8/pAM558kVmj7VPVyVMAqqGeU5kdRVD4Q89pDTgnvwvVZNOW2zTSz0cL3VUo3ZKiaR0kjh2bzieCwZNNaxO66a59Uz6zvsEWOe/6uMfHC2Oz6Smk0bafUiNxsDWvA5iQfPB797OVtKK3wUdZXVMAcJax7ZJcnIJDQ0Y7OAC1Vbo+1VNZNUx+t0ks53pvU6l8LZT2uDTgnvQHg06WnU+sfU8ep70Wd35vT9Gd/Hf8ANz3pbIpKV+haFtLudI0vE4bzEm8Tx78Y8sKS2210dst4orfA2CmAPss7TzJJ4k95WoGjLQyCCOmFVSvhiEPTU1Q+KR7ByDy0je80B4qOqiodU6trIgXUcFPDJOI+uZrXFwH426G58kqafUt0s7a81dot9FPD0wjMLpi2MjPtO3mjlz4YUktdpobXb/UqKnaynJJc05cXk8y4niSe0rT0+irRAWsaKt1I1282jfUvdTg5z8wnBHceCAi0Li7YM85z/Anjy3yFZdN/m0X5A/QtYNO28adfZBG8W9zXMLN85ALt4gHxK2zGhjGtHIDAQDd80+CimgqhlLs9oaiQOLIoZJHBvPAc48FKyvJa7dTWy2xUFIwtpogWta4l3Akk8Tz5oCOW2q1TeKCCvp5bRQUtQwSxxvjfM4MIyN5wc0Zx2LU2El2xmt9prv4NWcW8vnScu5b5uirWwGJktwbQkkmibVvEHE5I3M8u7kthR2CgpLBJZoGPFA9sjCze4gPJLgD1fOKAiOoxVti0M6nkpo424G/VNLohKYR0eQCOPzsd62F+tWqLpaKqir66xspZ2bj3dBIN3vBLuBCk9Ra6OqtQt1VAyaj6MR9HJx4Dl58Oa08WjLWySIyvr6mKJwcyCoq5JImkcvZJwcd6A8GoKPN40PTVzm1EkUz99xHB72wk73vGV7NprQdI1DsDeZNA5h/BPSs4rd1ltp6yuoaudrjNRPc+Eh2AC5u6cjr4FF4ttPd6B9HWhzoHOa4hrt05a4OHHxAQGl1n/pTS2f8AibR/4b1JzzWvvVppLzSCnrmPcxrxIxzHljmPHJzXDiCs7Vb4rZSerwSVEjd4vLp5XSvJP4zjlAanVk87qq0WyCpdSMuE7mSzsOHhrWl2609Tncs+OFoLvAzZ5UuutvaHWWpwyqpS4F7JMHdewnicnm3zU0u9spLvRmlr4RLFkOHEgtcOTmkcQR2hayj0nbKerZVSiprZ4wRG+tndN0efwQ44HigNhp+erqrLR1Fx6D1qWMPeIDlgzxAB6+GOK0mriLffLFe5gfUqZ0lPUP8AomyAAPPcCACe9byz2uls9IaWgY6On33PawvLgzPMNzyHcvXKxksbo5WNfG4brmuGQR2EIBMIkY18ZD2OGQ5pyCO3Ki8UzLrr6F9IRJBa6aRksreLelkIwzPaACSvu7RVkyQyGoiiPEwxVUjI/qh2Fu7fQ0ttpW01BTx08DeTIxgePigInog033V6vGGevGsBJ++Me6MY7s5+C9N4DP3QtPmnx60IJ/WN3n0OBu73dvcl5rXpqnr62/PutLNG83J8lNM1zon7hYwZa4EHBI8OC39lsNvsxlfQwu6ab+MmlkMkj8drnEnHcgI9ow0/3aawadz1w1LCM/OMe71d2efkvbewz7utOdAR62Gz9Njn0G7993b2Md68lv05BX3bUL7pSTM3q7pKadrnRv3TG0EseCDjI8FvbNYbfZ3Svoon9PN/GTyyOkkf4ucc47kBq9n5b0V7jkwbg24zesg/O4n2D4buMJ1Ib+6RR+r46QW+T1rd/B3m9Hvd+c4Xuummrdca31x4np63d3TUUszoXub2EtPHzXps9norPHK2iiIfKd6WWR5fJIe1ziclAabQ0MbKjUkrWASvuszXOxxIAGB8T719ZjjaPT99pf8A4zVuLdb4Leav1fe/hM7qmTeOfbdjOO7gvLebFS3WeCeaSqgqYA5rJqaZ0Tw12MtyOY4BAazUxEerdKSyHdj6aePePLedFwHnhfPaPPHFZqKGRwEs1fTiNvW7EgJW6rrLQ19pZbqyN01MwN3S95LwW8nb3Pe7+a1zNHWrIdMKqomD2PbNUVDpHt3HBwAJPAZAyBzQGOr4WT6m0oyVgewVUz8O5ZbGSPiAVjtG/wBUqp5+cyWF7T2OErcFbusoYauto6qYOM1I5zoiDgAuGDkdfBY3a3091oJKOsDjBIWlwa7B4EOHHxAQGp1WP+vdLf1g7/BkRev9ctM/k1R/8Nq29dQw1tRRzzhxkpJTNEQcYdulvHt4Er43e0Ul2ZCKsSh8Li+KWGV0ckZIwcOaQRkc0B49ZW+ausrn0Y/h9I9tXS/9ow5x5jI81rW10OqLxZm03tUVNE25TjseQREw94O8fzQtjUVzNPsgooLbd62PcLmyQtM+XZPBznOznryeCw0XaZLXb6iaqhZDW1076maNuCI94+ywY7B8coDfu5rFM80kAIQhAAWSxTQDQhCAChCAgNRq++Q6b0zcbvUYLKWEva0/fv5Nb5uIC4hPrl6vH31RcK6fzkle79pK6O9Js3eewWqit1FUz0Ms7pKh8MZfhzQNxpA5A5cfELnaK2XmnmZLBb7lFLGQ5j2U8jXNI5EEDgVc4exGxq+6XUiTqqusdR3PSF0odL2PTlmpelpKKHemkD2tEsxzvHie0uP53ctINA6hP+wtHjMz7VRRuetz/tepf7SoWTLhrjqqdTH8+oUmF00LdBrm+vEqKvCaaslWWXSv88voXk7Z9qH/AHSP+3Z9qwOgNQj/AGNh8JmfaqTNbrnH8fqf61QgV2uhyqNUfXqF15xUfzb68SP/AMeoup2/gX5bbLre1OHqTKljR94J2Ob9UnCl1tuF6qoHUmp9PPkgeN10sTWvafymZJ8x7lyyy6a/jPsVWqh4OqF6YdebQLHPDLUXa9RDPstrWucx+OrEgwVFmifNr0L9aXRSfS0TaX3JH26lVFTcqfQ7EttMyjooqeF8joYxhm+clreoZ58OXFa24uitlXJWU9BUXG6SjDdxuSxvUN7kxvxPeqq096QVrfbW/dBbquOvaMONI1r45D2jecC3w4+Kgeudteo77VdBp98looiQ1jIcOnkPe/HDwbjxKgR0cyvzT531Fm9zNCzV+XwLmuj9c3UODKaSjhPJkL2sPm4nKjkuhNSTv35KbfeebpJ2kn4qlpbhtEkJ6afVhPXk1AXmdNrn76XVHm6oVnEskSWYrE8OJTT4TFULeZz3fNU/Fi8WbPtRZ/zSP+2b9qzOgNRAf5mw/wD1mfaqJFTrYc5dTfWqFi6r1p9NqX61Qu3L1H82+vEjL+nqLqdv4F7R6J1NTzRyw0O7JG4Pa4Ss4EHIPNQf0lrBLS6gtt/NOYRc6cMqG8DuzsABGRw4tI+qVX/rmsx/P6k+vULzV41NcI2xV7b3VRtO8GTtmeAe3B61zcsj5Gve5MuonUdBDRNc2K+fX8PAtj0WtUeqXuu03UvxDXN9YpgTwErR7QHi3j+aumlwfp+mv1qvlvrrdba/12nnZJCBTv4uB4Dl18vNd3Ruc+Njnt3HkAlufmnsVXiDEbJpN2ltA5VbZdhkhCFAOw0JJoATSQgGhJCAaEk0AIQhACEIQAhJCAEIQgBCEkA0kIQAkhCAEkIQAkhCASEIQCQhCASEIQCQhCAEihIoAQhCAEIQgMTzSTPNCASEIQAEwkmEA0JIQDQEkwgGCRyOE993afekhAPePafenvO7T71imgMg934R96e+7tPvWATQGW+7tPvWr1JYrbqW1S2290rKqkfx3XEgtcOTmkcQR2hbJCyiqi3QFHV/o7WiSoLqC+19PET/ABcsTJSPP2VK9C7INOaTrY64dPcrjGcxz1RGIz2tYBgHvOT2Kx012dUyuTRV2RokbUW6IMOd2n3p7zu0rFNcDcy3ndpRk9pWKaAeT2lMOPaVimgMt49pQkhANCSaAE0kIBoQhACEIQAhCEAIQhACEIQAhCEAIQkgBCEIAQhJACEJIAQhCASEIQCQhCASEJIAQhCASEIQCSTQgEhCEAIQkUBimkmgEhCEADkgJDkmOaAaEDkhANJCEBkEICEAJpJoATS60wgBCfWgIATSTQAmkmgBNIJoATSTQDQkE0AJpICAaEIQAmkjqQDQkhANCEIAQhCAEIR1IASQhACEIQAhCEAJIQgBJNJACSEIAQhJACEJIAQjqQgEhCXUgBJNJABSQUIAQhCAFi5ZLA80ABCEIAQhCA//2Q==" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/home" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/dashboard" class="text-blue-600 font-medium">내 대시보드</a>
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">내 대시보드</h1>
          <p class="text-gray-600">프로필을 관리하고 구직 활동을 진행하세요</p>
        </div>

        {/* Dashboard Grid */}
        <div class="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Summary */}
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div class="text-center mb-6">
                <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i class="fas fa-user text-2xl text-gray-400" id="profile-avatar"></i>
                </div>
                <h3 class="font-semibold text-lg" id="profile-name">사용자명</h3>
                <p class="text-gray-600 text-sm" id="profile-email">이메일</p>
                <span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2" id="profile-status">
                  프로필 완성도: 0%
                </span>
              </div>
              
              <div class="space-y-3">
                <button onclick="showTab('profile')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab active">
                  <i class="fas fa-user mr-3 text-blue-600"></i>
                  <span>기본 정보</span>
                </button>
                <button onclick="showTab('education')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-graduation-cap mr-3 text-green-600"></i>
                  <span>학력 & 경력</span>
                </button>
                <button onclick="showTab('visa')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-passport mr-3 text-purple-600"></i>
                  <span>비자 & 언어</span>
                </button>
                <button onclick="showTab('documents')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-file-upload mr-3 text-orange-600"></i>
                  <span>이력서 & 서류</span>
                </button>
                <button onclick="showTab('applications')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-briefcase mr-3 text-red-600"></i>
                  <span>지원 현황</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h4 class="font-semibold mb-4">빠른 액션</h4>
              <div class="space-y-3">
                <button onclick="window.location.href='/jobs'" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-search mr-2"></i>
                  구인공고 찾기
                </button>
                <button onclick="downloadResume()" class="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-download mr-2"></i>
                  이력서 다운로드
                </button>
                <button onclick="updateProfileCompletion()" class="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
                  <i class="fas fa-check-circle mr-2"></i>
                  프로필 완성하기
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div class="lg:col-span-2">
            {/* Profile Tab */}
            <div id="profile-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">기본 정보</h3>
                <button onclick="toggleProfileEdit()" id="edit-profile-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-edit mr-2"></i>편집
                </button>
              </div>

              <form id="profile-form" class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <input type="text" name="first_name" id="first_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled  />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">성</label>
                    <input type="text" name="last_name" id="last_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">국적 *</label>
                    <select name="nationality" id="nationality" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                      <option value="">선택하세요</option>
                      <option value="USA">미국</option>
                      <option value="China">중국</option>
                      <option value="Japan">일본</option>
                      <option value="Vietnam">베트남</option>
                      <option value="Philippines">필리핀</option>
                      <option value="Thailand">태국</option>
                      <option value="India">인도</option>
                      <option value="Other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                    <input type="date" name="birth_date" id="birth_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">성별</label>
                    <select name="gender" id="gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                      <option value="">선택하세요</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input type="tel" name="phone" id="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">현재 거주지 *</label>
                  <select name="current_location" id="current_location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                    <option value="">지역을 선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="강원도">강원도</option>
                    <option value="충청도">충청도</option>
                    <option value="경상도">경상도</option>
                    <option value="전라도">전라도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">희망 근무지</label>
                  <select name="preferred_location" id="preferred_location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                    <option value="">희망 지역을 선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="강원도">강원도</option>
                    <option value="충청도">충청도</option>
                    <option value="경상도">경상도</option>
                    <option value="전라도">전라도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">희망 연봉 (원)</label>
                  <input type="number" name="salary_expectation" id="salary_expectation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 35000000" disabled />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                  <textarea name="bio" id="bio" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="자신을 소개해주세요..." disabled></textarea>
                </div>

                <div class="flex space-x-4" id="profile-form-actions" style="display: none;">
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                  <button type="button" onclick="cancelProfileEdit()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    취소
                  </button>
                </div>
              </form>
            </div>

            {/* Education Tab */}
            <div id="education-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">학력 & 경력</h3>
              
              <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">학력 정보</h4>
                  <button onclick="addEducation()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <i class="fas fa-plus mr-2"></i>추가
                  </button>
                </div>
                
                <div class="space-y-4" id="education-list">
                  <div class="border rounded-lg p-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">학교명</label>
                        <input type="text" name="school_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 서울대학교" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">전공</label>
                        <input type="text" name="major" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 컴퓨터공학" />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">학위</label>
                        <select name="degree" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="Bachelor">학사</option>
                          <option value="Master">석사</option>
                          <option value="PhD">박사</option>
                          <option value="Associate">전문학사</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">입학년도</label>
                        <input type="number" name="start_year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2020" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">졸업년도</label>
                        <input type="number" name="end_year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">경력 사항</h4>
                  <button onclick="addExperience()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <i class="fas fa-plus mr-2"></i>추가
                  </button>
                </div>
                
                <div class="space-y-4" id="experience-list">
                  <div class="border rounded-lg p-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                        <input type="text" name="company_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 삼성전자" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">직책</label>
                        <input type="text" name="position" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 소프트웨어 엔지니어" />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                        <input type="date" name="start_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                        <input type="date" name="end_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <label class="flex items-center mt-2">
                          <input type="checkbox" name="current_job" class="mr-2" />
                          <span class="text-sm text-gray-600">현재 재직중</span>
                        </label>
                      </div>
                    </div>
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">담당업무</label>
                      <textarea name="job_description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="주요 담당업무를 설명해주세요..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <button onclick="saveEducationAndExperience()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </div>

            {/* Visa & Language Tab */}
            <div id="visa-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">비자 & 언어 정보</h3>
              
              <form id="visa-form" class="space-y-6">
                <div class="border rounded-lg p-6 bg-blue-50">
                  <h4 class="font-semibold text-blue-800 mb-4">
                    <i class="fas fa-passport mr-2"></i>비자 정보
                  </h4>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">현재 비자 유형 *</label>
                      <select name="visa_status" id="visa_status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택하세요</option>
                        <option value="E-7">E-7 (특정활동)</option>
                        <option value="E-9">E-9 (비전문취업)</option>
                        <option value="D-2">D-2 (유학)</option>
                        <option value="D-4">D-4 (일반연수)</option>
                        <option value="D-10">D-10 (구직)</option>
                        <option value="F-2">F-2 (거주)</option>
                        <option value="F-4">F-4 (재외동포)</option>
                        <option value="F-5">F-5 (영주)</option>
                        <option value="F-6">F-6 (결혼이민)</option>
                        <option value="H-2">H-2 (방문취업)</option>
                        <option value="Other">기타</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비자 만료일</label>
                      <input type="date" name="visa_expiry" id="visa_expiry" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <label class="flex items-center">
                      <input type="checkbox" name="visa_sponsorship_needed" id="visa_sponsorship_needed" class="mr-2" />
                      <span class="text-sm text-gray-700">비자 스폰서십이 필요합니다</span>
                    </label>
                  </div>
                </div>

                <div class="border rounded-lg p-6 bg-green-50">
                  <h4 class="font-semibold text-green-800 mb-4">
                    <i class="fas fa-language mr-2"></i>언어 능력
                  </h4>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">한국어 수준 *</label>
                      <select name="korean_level" id="korean_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택하세요</option>
                        <option value="beginner">초급 (기초 회화 가능)</option>
                        <option value="elementary">초중급 (간단한 업무 의사소통 가능)</option>
                        <option value="intermediate">중급 (일반적인 업무 의사소통 가능)</option>
                        <option value="advanced">고급 (유창한 의사소통 가능)</option>
                        <option value="native">원어민 수준</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">영어 수준</label>
                      <select name="english_level" id="english_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">선택하세요</option>
                        <option value="beginner">초급</option>
                        <option value="elementary">초중급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                        <option value="native">원어민</option>
                      </select>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">기타 언어</label>
                    <input type="text" name="other_languages" id="other_languages" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 중국어(고급), 일본어(중급)" />
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">어학 자격증</label>
                    <textarea name="language_certificates" id="language_certificates" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: TOPIK 5급, TOEIC 900점, JLPT N2 등"></textarea>
                  </div>
                </div>

                <div class="border rounded-lg p-6 bg-purple-50">
                  <h4 class="font-semibold text-purple-800 mb-4">
                    <i class="fas fa-tools mr-2"></i>기술 스킬
                  </h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">보유 기술 및 스킬 *</label>
                    <textarea name="skills" id="skills" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: Java, Python, React, MySQL, Photoshop, 등 보유하신 기술과 스킬을 입력해주세요" required></textarea>
                    <p class="text-sm text-gray-600 mt-1">쉼표(,)로 구분하여 입력해주세요</p>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">자격증</label>
                    <textarea name="certifications" id="certifications" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 정보처리기사, AWS Certified, 등 보유하신 자격증을 입력해주세요"></textarea>
                  </div>
                </div>

                <div class="mt-8">
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                </div>
              </form>
            </div>

            {/* Documents Tab */}
            <div id="documents-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">이력서 & 서류 관리</h3>
              
              <div class="space-y-8">
                {/* Resume Upload */}
                <div class="border rounded-lg p-6 bg-orange-50">
                  <h4 class="font-semibold text-orange-800 mb-4">
                    <i class="fas fa-file-alt mr-2"></i>이력서
                  </h4>
                  
                  <div class="mb-4" id="current-resume">
                    <p class="text-sm text-gray-600 mb-2">현재 등록된 이력서:</p>
                    <div class="bg-white border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <i class="fas fa-file-pdf text-3xl text-gray-400 mb-2"></i>
                      <p class="text-gray-500">등록된 이력서가 없습니다</p>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">새 이력서 업로드</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="uploadResume()" />
                      <label for="resume-upload" class="cursor-pointer">
                        <i class="fas fa-cloud-upload-alt text-4xl text-blue-500 mb-4"></i>
                        <p class="text-lg font-medium text-gray-700">파일을 선택하거나 드래그하여 업로드</p>
                        <p class="text-sm text-gray-500 mt-2">PDF, DOC, DOCX 파일만 지원 (최대 5MB)</p>
                      </label>
                    </div>
                  </div>
                  
                  <div class="flex space-x-4">
                    <button onclick="uploadResume()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-upload mr-2"></i>이력서 업로드
                    </button>
                    <button onclick="downloadResume()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      <i class="fas fa-download mr-2"></i>다운로드
                    </button>
                  </div>
                </div>

                {/* Portfolio */}
                <div class="border rounded-lg p-6 bg-blue-50">
                  <h4 class="font-semibold text-blue-800 mb-4">
                    <i class="fas fa-briefcase mr-2"></i>포트폴리오 & 작업물
                  </h4>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">포트폴리오 URL</label>
                    <input type="url" name="portfolio_url" id="portfolio_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://myportfolio.com" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                    <input type="url" name="github_url" id="github_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://github.com/username" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input type="url" name="linkedin_url" id="linkedin_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://linkedin.com/in/username" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">포트폴리오 파일 업로드</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input type="file" id="portfolio-upload" accept=".pdf,.jpg,.png,.gif,.zip" multiple class="hidden" onchange="uploadPortfolio()" />
                      <label for="portfolio-upload" class="cursor-pointer text-sm text-gray-600">
                        <i class="fas fa-cloud-upload-alt mr-2"></i>포트폴리오 파일 업로드 (여러 파일 가능)
                        <p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, GIF, ZIP 파일 지원 (각 파일 최대 10MB)</p>
                      </label>
                    </div>
                  </div>
                  
                  <button onclick="savePortfolioLinks()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                </div>

                {/* Additional Documents */}
                <div class="border rounded-lg p-6 bg-gray-50">
                  <h4 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-folder mr-2"></i>추가 서류
                  </h4>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">커버레터</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="cover-letter-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="uploadDocument('cover_letter', 'cover-letter-upload')" />
                        <label for="cover-letter-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>커버레터 업로드
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">학위증명서</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="diploma-upload" accept=".pdf,.jpg,.png" class="hidden" onchange="uploadDocument('diploma', 'diploma-upload')" />
                        <label for="diploma-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>학위증명서 업로드
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">자격증</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="certificates-upload" accept=".pdf,.jpg,.png" multiple class="hidden" onchange="uploadDocument('certificate', 'certificates-upload')" />
                        <label for="certificates-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>자격증 업로드 (여러 파일 가능)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Tab */}
            <div id="applications-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">지원 현황</h3>
              
              <div class="mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600" id="total-applications">0</div>
                    <div class="text-sm text-blue-600">총 지원</div>
                  </div>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-yellow-600" id="pending-applications">0</div>
                    <div class="text-sm text-yellow-600">검토중</div>
                  </div>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600" id="accepted-applications">0</div>
                    <div class="text-sm text-green-600">합격</div>
                  </div>
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-red-600" id="rejected-applications">0</div>
                    <div class="text-sm text-red-600">불합격</div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4" id="applications-list">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-inbox text-4xl mb-4"></i>
                  <p>아직 지원한 공고가 없습니다.</p>
                  <button onclick="window.location.href='/jobs'" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    구인공고 찾아보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )

// 📧 이메일 찾기 API
// 🔐 로그인 API
}

// Middleware: none
